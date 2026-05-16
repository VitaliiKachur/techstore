import { Role } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createToken } from "../lib/jwt";
import { prismaMock } from "../test/prisma-mock";
import { createApp } from "../app";

const sampleProduct = {
  id: "prod-1",
  title: "iPhone 15",
  description: "Flagship phone",
  details: null,
  price: 39999,
  stock: 5,
  image: "/products/iphone.png",
  galleryImages: [],
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Смартфони", image: null, createdAt: new Date() },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("products routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists products with pagination meta", async () => {
    prismaMock.$transaction.mockResolvedValue([[sampleProduct], 1]);

    const response = await request(createApp()).get("/api/products?name=iphone");

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  it("returns product details", async () => {
    prismaMock.product.findUnique.mockResolvedValue(sampleProduct);

    const response = await request(createApp()).get("/api/products/prod-1");

    expect(response.status).toBe(200);
    expect(response.body.product.title).toBe("iPhone 15");
  });

  it("returns 404 for missing product", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const response = await request(createApp()).get("/api/products/missing");

    expect(response.status).toBe(404);
  });

  it("rejects invalid product payload for admins", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });

    const response = await request(createApp())
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Phone" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("required");
  });

  it("creates a product for admins", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });
    prismaMock.product.create.mockResolvedValue(sampleProduct);

    const response = await request(createApp())
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "iPhone 15",
        description: "Flagship phone",
        price: 39999,
        stock: 5,
        image: "/products/iphone.png",
        galleryImages: [],
        categoryId: "cat-1",
      });

    expect(response.status).toBe(201);
    expect(response.body.product.title).toBe("iPhone 15");
  });

  it("filters promotion products", async () => {
    prismaMock.promotion.findFirst.mockResolvedValue({
      id: "promo-1",
      active: true,
      productIds: ["prod-1"],
      updatedAt: new Date(),
    });
    prismaMock.$transaction.mockResolvedValue([[sampleProduct], 1]);

    const response = await request(createApp()).get("/api/products?promotion=active");

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
  });
});
