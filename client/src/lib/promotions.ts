import { getAuthToken } from "@/lib/auth";
import { CartItem } from "@/lib/cart";
import { Product } from "@/lib/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type Promotion = {
  id: string;
  type: PromotionType;
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  minQuantity: number;
  active: boolean;
  productIds: string[];
  products: Product[];
};

export type PromotionType = "QUANTITY_DISCOUNT" | "PRODUCT_DISCOUNT";

export type PromotionPayload = {
  type: PromotionType;
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  minQuantity: number;
  active: boolean;
  productIds: string[];
};

type PromotionResponse = {
  promotion: Promotion | null;
};

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    // ignore invalid JSON
  }

  return fallback;
}

function getAdminHeaders() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Токен відсутній.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function loadActivePromotion(): Promise<Promotion | null> {
  const response = await fetch(`${API_URL}/api/promotions/active`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося завантажити акцію."));
  }

  const data = (await response.json()) as PromotionResponse;
  return data.promotion;
}

export async function loadAdminPromotion(): Promise<Promotion | null> {
  const response = await fetch(`${API_URL}/api/promotions/admin`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося завантажити акцію."));
  }

  const data = (await response.json()) as PromotionResponse;
  return data.promotion;
}

export async function updateAdminPromotion(payload: PromotionPayload): Promise<Promotion> {
  const response = await fetch(`${API_URL}/api/promotions/admin`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося зберегти акцію."));
  }

  const data = (await response.json()) as PromotionResponse;

  if (!data.promotion) {
    throw new Error("Акцію не збережено.");
  }

  return data.promotion;
}

export function calculatePromotionDiscount(promotion: Promotion | null, items: CartItem[]) {
  if (!promotion?.active || promotion.discountPercent <= 0 || promotion.productIds.length === 0) {
    return 0;
  }

  const eligibleItems = items.filter((item) => promotion.productIds.includes(item.product.id));
  const eligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
  const minQuantity = promotion.type === "PRODUCT_DISCOUNT" ? 1 : promotion.minQuantity;

  if (eligibleQuantity < minQuantity) {
    return 0;
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return Math.round(eligibleSubtotal * (promotion.discountPercent / 100));
}

export function getPromotionalPrice(productPrice: number, promotion: Promotion | null) {
  if (!promotion?.active || promotion.type !== "PRODUCT_DISCOUNT" || promotion.discountPercent <= 0) {
    return null;
  }

  return Math.max(0, Math.round(productPrice * (1 - promotion.discountPercent / 100)));
}
