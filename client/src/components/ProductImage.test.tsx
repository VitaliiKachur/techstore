import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductImage from "./ProductImage";

describe("ProductImage", () => {
  it("renders uploaded or remote images", () => {
    render(<ProductImage alt="Phone" src="/products/phone.png" />);

    expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute(
      "src",
      "/products/phone.png"
    );
  });

  it("renders placeholder visual for preset colors", () => {
    const { container } = render(<ProductImage alt="Laptop" src="product-cyan" />);

    expect(container.querySelector(".product-visual-cyan")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
