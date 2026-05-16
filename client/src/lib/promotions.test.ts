import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculatePromotionDiscount,
  getPromotionalPrice,
  loadActivePromotion,
  loadAdminPromotion,
  updateAdminPromotion,
  type Promotion,
} from "./promotions";
import { type CartItem } from "./cart";

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(() => "admin-token"),
}));

const promotion: Promotion = {
  id: "promo-1",
  type: "PRODUCT_DISCOUNT",
  title: "Товари дня",
  subtitle: "Добірка дня",
  badge: "-10%",
  discountPercent: 10,
  minQuantity: 1,
  active: true,
  productIds: ["product-1"],
  products: [],
};

const items: CartItem[] = [
  {
    product: {
      id: "product-1",
      title: "Laptop",
      price: 1000,
      stock: 5,
      image: "/laptop.webp",
      categoryName: "Ноутбуки",
    },
    quantity: 2,
  },
  {
    product: {
      id: "product-2",
      title: "Phone",
      price: 500,
      stock: 5,
      image: "/phone.webp",
      categoryName: "Смартфони",
    },
    quantity: 2,
  },
];

describe("promotions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calculates discount only for eligible products", () => {
    expect(calculatePromotionDiscount(promotion, items)).toBe(200);
  });

  it("returns zero discount for inactive or empty promotions", () => {
    expect(calculatePromotionDiscount({ ...promotion, active: false }, items)).toBe(0);
    expect(calculatePromotionDiscount({ ...promotion, productIds: [] }, items)).toBe(0);
    expect(calculatePromotionDiscount(null, items)).toBe(0);
  });

  it("calculates promotional price with a zero floor", () => {
    expect(getPromotionalPrice(1000, promotion)).toBe(900);
    expect(getPromotionalPrice(1000, { ...promotion, discountPercent: 150 })).toBe(0);
    expect(getPromotionalPrice(1000, { ...promotion, active: false })).toBeNull();
  });

  it("loads public and admin promotions", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ promotion }),
      } as Response));

    await expect(loadActivePromotion()).resolves.toEqual(promotion);
    await expect(loadAdminPromotion()).resolves.toEqual(promotion);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5000/api/promotions/admin",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer admin-token" }),
      })
    );
  });

  it("updates admin promotion and rejects empty responses", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ promotion }),
      } as Response))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ promotion: null }),
      } as Response));

    await expect(updateAdminPromotion(promotion)).resolves.toEqual(promotion);
    await expect(updateAdminPromotion(promotion)).rejects.toThrow("Акцію не збережено.");
  });
});
