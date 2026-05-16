import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockCatalogFetch } from "@/test/fetch-mocks";
import StorefrontCatalog from "./StorefrontCatalog";

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

describe("StorefrontCatalog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders compact catalog section", async () => {
    mockCatalogFetch();
    render(<StorefrontCatalog />);

    expect(await screen.findByText("Підібрано для тебе")).toBeInTheDocument();
  });
});
