import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductsPage from "./page";

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("./ProductsPageClient", () => ({
  default: () => <div>Products client</div>,
}));

describe("ProductsPage", () => {
  it("renders catalog page shell", () => {
    render(<ProductsPage />);

    expect(screen.getByText("Товари TechStore")).toBeInTheDocument();
    expect(screen.getByText("Products client")).toBeInTheDocument();
  });
});
