import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CART_STORAGE_KEY,
  addCartItem,
  clearCartItems,
  getCartItems,
  getCartSummary,
  removeCartItem,
  subscribeToCartUpdates,
  updateCartItemQuantity,
  type CartProduct,
} from "./cart";

const product: CartProduct = {
  id: "product-1",
  title: "Test laptop",
  price: 1000,
  stock: 3,
  image: "/product.webp",
  categoryName: "Ноутбуки",
};

describe("cart", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCartItems();
  });

  it("adds products and caps quantity by stock", () => {
    addCartItem(product, 2);
    const items = addCartItem(product, 5);

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(getCartItems()).toEqual(items);
  });

  it("updates, removes and summarizes cart items", () => {
    addCartItem(product, 2);
    updateCartItemQuantity(product.id, 1);

    expect(getCartSummary(getCartItems())).toEqual({
      subtotal: 1000,
      totalQuantity: 1,
    });

    removeCartItem(product.id);
    expect(getCartItems()).toEqual([]);
  });

  it("ignores invalid stored cart values", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ product: null }]));

    expect(getCartItems()).toEqual([]);
  });

  it("notifies subscribers when the cart changes", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToCartUpdates(callback);

    addCartItem(product);
    unsubscribe();
    addCartItem({ ...product, id: "product-2" });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
