import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckoutPage from "./page";

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/components/CheckoutPageClient", () => ({
  default: () => <div>Checkout content</div>,
}));

describe("CheckoutPage", () => {
  it("renders checkout layout", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Checkout content")).toBeInTheDocument();
  });
});
