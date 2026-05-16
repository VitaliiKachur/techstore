import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockCatalogFetch } from "@/test/fetch-mocks";
import ProductsCatalog from "./ProductsCatalog";

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
  loadActivePromotion: vi.fn().mockResolvedValue(null),
}));

describe("ProductsCatalog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders products from api", async () => {
    mockCatalogFetch();
    render(<ProductsCatalog title="Каталог" />);

    expect(await screen.findByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText("Каталог")).toBeInTheDocument();
  });
});
