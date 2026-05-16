import { vi } from "vitest";

export function mockCatalogFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/categories")) {
        return {
          ok: true,
          json: async () => ({
            categories: [
              {
                id: "cat-1",
                name: "Смартфони",
                image: null,
                _count: { products: 1 },
              },
            ],
          }),
        } as Response;
      }

      if (url.includes("/api/products")) {
        return {
          ok: true,
          json: async () => ({
            products: [
              {
                id: "prod-1",
                title: "iPhone 15",
                description: "Phone",
                details: null,
                price: 39999,
                stock: 3,
                image: "/products/iphone.png",
                galleryImages: [],
                category: { id: "cat-1", name: "Смартфони", image: null },
              },
            ],
            meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
          }),
        } as Response;
      }

      if (url.includes("/api/promotions/active")) {
        return {
          ok: true,
          json: async () => ({ promotion: null }),
        } as Response;
      }

      return {
        ok: false,
        json: async () => ({}),
      } as Response;
    })
  );
}
