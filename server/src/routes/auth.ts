import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import { createToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

const router = Router();
const PASSWORD_MIN_LENGTH = 6;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleOAuthClient = googleClientId ? new OAuth2Client(googleClientId) : null;

router.post("/register", async (req, res, next): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      res.status(400).json({ message: "Password must contain at least 6 characters" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: passwordHash,
      },
      select: publicUserSelect,
    });

    res.status(201).json({
      user,
      token: createToken({ userId: user.id, role: user.role }),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "User with this email already exists" });
      return;
    }

    next(error);
  }
});

router.post("/login", async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token: createToken({ userId: user.id, role: user.role }),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next): Promise<void> => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      res.status(400).json({ message: "Google credential is required" });
      return;
    }

    if (!googleOAuthClient || !googleClientId) {
      res.status(500).json({ message: "Google auth is not configured on server" });
      return;
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.name) {
      res.status(400).json({ message: "Google account payload is invalid" });
      return;
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name.trim();
    const fallbackPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        password: fallbackPasswordHash,
      },
      select: publicUserSelect,
    });

    res.json({
      user,
      token: createToken({ userId: user.id, role: user.role }),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
      select: publicUserSelect,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export default router;
