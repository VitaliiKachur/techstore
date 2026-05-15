import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { sortProductsByPromotionOrder } from "../lib/promotions";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/active", async (_req, res, next): Promise<void> => {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ promotion: promotion ? await includePromotionProducts(promotion) : null });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const promotion = await prisma.promotion.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    res.json({ promotion: promotion ? await includePromotionProducts(promotion) : null });
  } catch (error) {
    next(error);
  }
});

router.put("/admin", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = parsePromotionBody(req.body);

    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const existingPromotion = await prisma.promotion.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const promotion = existingPromotion
      ? await prisma.promotion.update({
          where: { id: existingPromotion.id },
          data: parsed.data,
        })
      : await prisma.promotion.create({ data: parsed.data });

    res.json({ promotion: await includePromotionProducts(promotion) });
  } catch (error) {
    next(error);
  }
});

async function includePromotionProducts(promotion: Prisma.PromotionGetPayload<Record<string, never>>) {
  const products = promotion.productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: promotion.productIds } },
        include: { category: true },
      })
    : [];

  return {
    ...promotion,
    products: sortProductsByPromotionOrder(products, promotion.productIds),
  };
}

function parsePromotionBody(
  body: unknown
):
  | {
      ok: true;
      data: Prisma.PromotionCreateInput & Prisma.PromotionUpdateInput;
    }
  | { ok: false; message: string } {
  const source = body as Partial<{
    type: string;
    title: string;
    subtitle: string;
    badge: string;
    discountPercent: number;
    minQuantity: number;
    active: boolean;
    productIds: string[];
  }>;

  const title = source.title?.trim();
  const subtitle = source.subtitle?.trim();
  const badge = source.badge?.trim();
  const type = "PRODUCT_DISCOUNT";
  const discountPercent = Number(source.discountPercent);
  const minQuantity = Number(source.minQuantity);

  if (!title || !subtitle || !badge) {
    return { ok: false, message: "Promotion title, subtitle and badge are required" };
  }

  if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 90) {
    return { ok: false, message: "Discount must be an integer from 0 to 90" };
  }

  if (!Number.isInteger(minQuantity) || minQuantity < 1 || minQuantity > 99) {
    return { ok: false, message: "Minimum quantity must be an integer from 1 to 99" };
  }

  if (!Array.isArray(source.productIds)) {
    return { ok: false, message: "Promotion products must be an array" };
  }

  const productIds = Array.from(
    new Set(source.productIds.map((productId) => String(productId).trim()).filter(Boolean))
  );

  const data = {
    ok: true,
    data: {
      title,
      type,
      subtitle,
      badge,
      discountPercent,
      minQuantity,
      active: Boolean(source.active),
      productIds,
    },
  };

  return data as {
    ok: true;
    data: Prisma.PromotionCreateInput & Prisma.PromotionUpdateInput;
  };
}

export default router;
