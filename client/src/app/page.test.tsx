import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/components/StorefrontCatalog", () => ({
  default: () => <section>Catalog</section>,
}));

describe("Home page", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders storefront hero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ promotion: null }),
      })
    );

    render(await Home());

    expect(screen.getByRole("heading", { name: "TechStore", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
  });
});
