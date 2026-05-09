import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res, next): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };

    if (!name?.trim()) {
      res.status(400).json({ message: "Category name is required" });
      return;
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    res.status(201).json({ category });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }

    next(error);
  }
});

export default router;
