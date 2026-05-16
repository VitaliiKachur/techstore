import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearCartItems } from "@/lib/cart";
import CheckoutPageClient from "./CheckoutPageClient";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/auth", () => ({
  loadCurrentUser: vi.fn().mockRejectedValue(new Error("guest")),
}));

vi.mock("@/lib/promotions", () => ({
  calculatePromotionDiscount: () => 0,
  loadActivePromotion: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/orders", () => ({
  createCustomerOrder: vi.fn(),
}));

describe("CheckoutPageClient", () => {
  beforeEach(() => {
    clearCartItems();
  });

  it("shows empty checkout state", async () => {
    render(<CheckoutPageClient />);

    expect(await screen.findByText(/кошик порожній/i)).toBeInTheDocument();
  });
});
