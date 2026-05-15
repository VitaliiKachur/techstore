import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res, next): Promise<void> => {
  try {
    const name =
      typeof req.query.name === "string"
        ? req.query.name.trim()
        : typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";
    const minPrice = getNonNegativeNumber(req.query.minPrice);
    const maxPrice = getNonNegativeNumber(req.query.maxPrice);
    const categoryId =
      typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const promotionOnly = req.query.promotion === "active";
    const page = getPositiveNumber(req.query.page, 1);
    const limit = Math.min(getPositiveNumber(req.query.limit, 12), 50);
    const skip = (page - 1) * limit;
    const activePromotion = promotionOnly
      ? await prisma.promotion.findFirst({
          where: { active: true },
          orderBy: { updatedAt: "desc" },
        })
      : null;
    const promotionProductIds = activePromotion?.productIds ?? [];

    const where: Prisma.ProductWhereInput = {
      ...(categoryId ? { categoryId } : {}),
      ...(promotionOnly ? { id: { in: promotionProductIds } } : {}),
      ...(name
        ? {
            title: { contains: name, mode: "insensitive" },
          }
        : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next): Promise<void> => {
  try {
    const productId = getParam(req.params.id);

    if (!productId) {
      res.status(400).json({ message: "Product id is required" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = parseProductBody(req.body);

    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const product = await prisma.product.create({
      data: parsed.data as Prisma.ProductCreateInput,
      include: { category: true },
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = parseProductBody(req.body, true);

    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const productId = getParam(req.params.id);

    if (!productId) {
      res.status(400).json({ message: "Product id is required" });
      return;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: parsed.data,
      include: { category: true },
    });

    res.json({ product });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    next(error);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const productId = getParam(req.params.id);

    if (!productId) {
      res.status(400).json({ message: "Product id is required" });
      return;
    }

    await prisma.product.delete({ where: { id: productId } });
    res.status(204).send();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    next(error);
  }
});

function getPositiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getNonNegativeNumber(value: unknown): number | undefined {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseProductBody(
  body: unknown,
  partial = false
):
  | { ok: true; data: Prisma.ProductCreateInput | Prisma.ProductUpdateInput }
  | { ok: false; message: string } {
  const source = body as Partial<{
    title: string;
    description: string;
    details: string | null;
    price: number;
    stock: number;
    image: string;
    galleryImages: string[];
    categoryId: string;
  }>;

  if (!partial) {
    const missingRequiredField =
      !source.title?.trim() ||
      !source.description?.trim() ||
      !source.image?.trim() ||
      !source.categoryId?.trim();

    if (missingRequiredField) {
      return { ok: false, message: "Title, description, image and categoryId are required" };
    }
  }

  const data: Prisma.ProductCreateInput | Prisma.ProductUpdateInput = {};

  if (source.title !== undefined) data.title = source.title.trim();
  if (source.description !== undefined) data.description = source.description.trim();
  if (source.details !== undefined) {
    data.details = normalizeOptionalString(source.details);
  }
  if (source.image !== undefined) data.image = source.image.trim();
  if (source.galleryImages !== undefined) {
    if (!Array.isArray(source.galleryImages)) {
      return { ok: false, message: "Gallery images must be an array" };
    }

    data.galleryImages = source.galleryImages
      .map((image) => (typeof image === "string" ? image.trim() : ""))
      .filter(Boolean);
  }

  if (source.price !== undefined) {
    const price = Number(source.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, message: "Price must be a positive number" };
    }
    data.price = price;
  }

  if (source.stock !== undefined) {
    const stock = Number(source.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return { ok: false, message: "Stock must be a positive integer" };
    }
    data.stock = stock;
  }

  if (!partial && (data.price === undefined || data.stock === undefined)) {
    return { ok: false, message: "Price and stock are required" };
  }

  if (source.categoryId !== undefined) {
    data.category = { connect: { id: source.categoryId } };
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
