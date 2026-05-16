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
    const parsed = parseCategoryBody(req.body);

    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const category = await prisma.category.create({
      data: parsed.data,
      include: {
        _count: {
          select: { products: true },
        },
      },
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

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const categoryId = typeof req.params.id === "string" ? req.params.id.trim() : "";
    const parsed = parseCategoryBody(req.body);

    if (!categoryId) {
      res.status(400).json({ message: "Category id is required" });
      return;
    }

    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: parsed.data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({ category });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    next(error);
  }
});

type CategoryBodyData = {
  name: string;
  image: string | null;
};

function parseCategoryBody(body: unknown):
  | { ok: true; data: CategoryBodyData }
  | { ok: false; message: string } {
  const source = body as Partial<{
    name: string;
    image: string | null;
  }>;

  if (!source.name?.trim()) {
    return { ok: false, message: "Category name is required" };
  }

  const data: CategoryBodyData = {
    name: source.name.trim(),
    image: null,
  };

  if (source.image !== undefined) {
    data.image = normalizeOptionalString(source.image);
  }

  return { ok: true, data };
}

function normalizeOptionalString(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export default router;
