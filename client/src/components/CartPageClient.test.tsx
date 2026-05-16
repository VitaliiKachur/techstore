import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearCartItems } from "@/lib/cart";
import CartPageClient from "./CartPageClient";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/promotions", () => ({
  calculatePromotionDiscount: () => 0,
  loadActivePromotion: vi.fn().mockResolvedValue(null),
}));

describe("CartPageClient", () => {
  beforeEach(() => {
    clearCartItems();
  });

  it("shows empty cart message", async () => {
    render(<CartPageClient />);

    expect(await screen.findByText("Кошик порожній")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "До каталогу" })).toHaveAttribute("href", "/products");
  });
});
