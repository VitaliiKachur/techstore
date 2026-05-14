"use client";

import { useState } from "react";
import { addCartItem, CartProduct } from "@/lib/cart";

type AddToCartButtonProps = {
  product: CartProduct;
  className?: string;
  label?: string;
};

export default function AddToCartButton({
  product,
  className = "",
  label = "Додати",
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const isDisabled = product.stock <= 0;

  function handleAddToCart() {
    if (isDisabled) {
      return;
    }

    addCartItem(product);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  }

  return (
    <button
      className={className}
      disabled={isDisabled}
      onClick={handleAddToCart}
      type="button"
    >
      {isDisabled ? "Немає в наявності" : isAdded ? "Додано" : label}
    </button>
  );
}
