import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt";

export type AuthUser = {
  userId: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    (req as AuthenticatedRequest).user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;

  if (user.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
}
