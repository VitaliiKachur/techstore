import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProductPage from "./page";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/SiteHeader", () => ({
  default: () => createElement("header", null, "Header"),
}));

vi.mock("@/components/AddToCartButton", () => ({
  default: () => createElement("button", { type: "button" }, "Add"),
}));

vi.mock("@/components/ProductGallery", () => ({
  default: () => createElement("div", null, "Gallery"),
}));

describe("ProductPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders product details from api", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/promotions/active")) {
          return {
            ok: true,
            json: async () => ({ promotion: null }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({
            product: {
              id: "prod-1",
              title: "iPhone 15",
              description: "Flagship",
              details: "Details",
              price: 39999,
              stock: 2,
              image: "/products/iphone.png",
              galleryImages: [],
              category: { id: "cat-1", name: "Phones" },
            },
          }),
        } as Response;
      })
    );

    render(
      await ProductPage({
        params: Promise.resolve({ id: "prod-1" }),
      })
    );

    expect(await screen.findByRole("heading", { name: "iPhone 15" })).toBeInTheDocument();
    expect(screen.getByText("Flagship")).toBeInTheDocument();
  });
});
