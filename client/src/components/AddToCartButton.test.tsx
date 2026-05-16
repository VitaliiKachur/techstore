import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { clearCartItems, getCartItems } from "@/lib/cart";
import AddToCartButton from "./AddToCartButton";

const product = {
  id: "prod-1",
  title: "iPhone",
  price: 1000,
  image: "/products/iphone.png",
  stock: 3,
  category: { id: "cat-1", name: "Phones" },
};

describe("AddToCartButton", () => {
  beforeEach(() => {
    clearCartItems();
  });

  it("adds product to cart", async () => {
    const user = userEvent.setup();
    render(<AddToCartButton product={product} />);

    await user.click(screen.getByRole("button", { name: "Додати" }));

    expect(getCartItems()).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Додано" })).toBeInTheDocument();
  });

  it("disables button when product is out of stock", () => {
    render(<AddToCartButton product={{ ...product, stock: 0 }} />);

    expect(screen.getByRole("button", { name: "Немає в наявності" })).toBeDisabled();
  });
});
