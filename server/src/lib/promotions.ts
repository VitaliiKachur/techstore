import { Prisma, Product } from "@prisma/client";

export type PromotionCartItem = {
  productId: string;
  quantity: number;
  price: number;
};

type DiscountPromotion = {
  active: boolean;
  discountPercent: number;
  minQuantity: number;
  productIds: string[];
};

export function calculatePromotionDiscount(
  promotion: DiscountPromotion | null,
  items: PromotionCartItem[]
) {
  if (!promotion?.active || promotion.discountPercent <= 0 || promotion.productIds.length === 0) {
    return 0;
  }

  const eligibleItems = items.filter((item) => promotion.productIds.includes(item.productId));
  const eligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

  if (eligibleQuantity < promotion.minQuantity) {
    return 0;
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return Math.round(eligibleSubtotal * (promotion.discountPercent / 100));
}

export async function getActivePromotion(tx: Prisma.TransactionClient) {
  return tx.promotion.findFirst({
    where: { active: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function sortProductsByPromotionOrder(products: Product[], productIds: string[]) {
  return [...products].sort(
    (first, second) => productIds.indexOf(first.id) - productIds.indexOf(second.id)
  );
}
