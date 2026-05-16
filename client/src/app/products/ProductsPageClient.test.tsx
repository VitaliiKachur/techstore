import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductsPageClient from "./ProductsPageClient";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("category=Phones&name=iphone"),
}));

vi.mock("@/components/ProductsCatalog", () => ({
  default: ({ title, initialSearch }: { title: string; initialSearch: string }) => (
    <div>
      {title}:{initialSearch}
    </div>
  ),
}));

describe("ProductsPageClient", () => {
  it("passes search params to catalog", () => {
    render(<ProductsPageClient />);

    expect(screen.getByText("Товари категорії: Phones:iphone")).toBeInTheDocument();
  });
});
