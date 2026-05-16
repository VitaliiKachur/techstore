import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategory,
  createProduct,
  deleteProduct,
  loadCategories,
  loadProducts,
  updateCategory,
  updateProduct,
} from "./catalog";

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(() => "admin-token"),
}));

const category = {
  id: "category-1",
  name: "Ноутбуки",
  image: null,
  _count: { products: 2 },
};

const product = {
  id: "product-1",
  title: "Laptop",
  description: "Fast laptop",
  details: null,
  price: 1000,
  stock: 5,
  image: "/laptop.webp",
  galleryImages: [],
  category: { id: "category-1", name: "Ноутбуки" },
};

function mockJsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("catalog api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads categories and products with filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => mockJsonResponse({ categories: [category] }))
      .mockImplementationOnce(() => mockJsonResponse({ products: [product] }));

    await expect(loadCategories()).resolves.toEqual([category]);
    await expect(
      loadProducts({ categoryId: "category-1", search: " laptop ", limit: 12 })
    ).resolves.toEqual([product]);

    expect(String(fetchMock.mock.calls[1][0])).toContain("categoryId=category-1");
    expect(String(fetchMock.mock.calls[1][0])).toContain("search=laptop");
  });

  it("creates and updates categories with admin headers", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ category }));

    await createCategory({ name: "Ноутбуки", image: null });
    await updateCategory("category-1", { name: "Ігрові ноутбуки", image: "data:image/png;base64,a" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:5000/api/categories",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer admin-token" }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5000/api/categories/category-1",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("creates, updates and deletes products", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => mockJsonResponse({ product }))
      .mockImplementationOnce(() => mockJsonResponse({ product }))
      .mockImplementationOnce(() => mockJsonResponse({}, true));

    const payload = {
      title: "Laptop",
      description: "Fast laptop",
      details: null,
      price: 1000,
      stock: 5,
      image: "/laptop.webp",
      galleryImages: [],
      categoryId: "category-1",
    };

    await expect(createProduct(payload)).resolves.toEqual(product);
    await expect(updateProduct("product-1", payload)).resolves.toEqual(product);
    await expect(deleteProduct("product-1")).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("uses API error messages when requests fail", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      mockJsonResponse({ message: "Category exists" }, false)
    );

    await expect(createCategory({ name: "Ноутбуки", image: null })).rejects.toThrow(
      "Category exists"
    );
  });
});
