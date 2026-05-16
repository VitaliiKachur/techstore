import { describe, expect, it } from "vitest";
import {
  calculatePromotionDiscount,
  sortProductsByPromotionOrder,
  type PromotionCartItem,
} from "./promotions";

describe("promotion helpers", () => {
  const items: PromotionCartItem[] = [
    { productId: "product-1", price: 1000, quantity: 2 },
    { productId: "product-2", price: 500, quantity: 2 },
  ];

  it("calculates discount only for products included in promotion", () => {
    const discount = calculatePromotionDiscount(
      {
        active: true,
        discountPercent: 10,
        minQuantity: 1,
        productIds: ["product-1"],
      },
      items
    );

    expect(discount).toBe(200);
  });

  it("returns zero when promotion is inactive, empty or not matching", () => {
    expect(calculatePromotionDiscount(null, items)).toBe(0);
    expect(
      calculatePromotionDiscount(
        { active: false, discountPercent: 10, minQuantity: 1, productIds: ["product-1"] },
        items
      )
    ).toBe(0);
    expect(
      calculatePromotionDiscount(
        { active: true, discountPercent: 10, minQuantity: 1, productIds: ["product-3"] },
        items
      )
    ).toBe(0);
  });

  it("keeps promoted products in the configured order", () => {
    const products = [{ id: "product-2" }, { id: "product-1" }] as Parameters<
      typeof sortProductsByPromotionOrder
    >[0];

    expect(sortProductsByPromotionOrder(products, ["product-1", "product-2"]).map(({ id }) => id))
      .toEqual(["product-1", "product-2"]);
  });
});
