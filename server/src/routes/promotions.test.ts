import { Role } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createToken } from "../lib/jwt";
import { prismaMock } from "../test/prisma-mock";
import { createApp } from "../app";

describe("promotions routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active promotion or null", async () => {
    prismaMock.promotion.findFirst.mockResolvedValue(null);

    const response = await request(createApp()).get("/api/promotions/active");

    expect(response.status).toBe(200);
    expect(response.body.promotion).toBeNull();
  });

  it("requires admin role for admin promotion endpoint", async () => {
    const token = createToken({ userId: "user-1", role: Role.USER });

    const response = await request(createApp())
      .get("/api/promotions/admin")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("validates promotion payload for admins", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });

    const response = await request(createApp())
      .put("/api/promotions/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Sale" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("required");
  });

  it("returns active promotion with products", async () => {
    prismaMock.promotion.findFirst.mockResolvedValue({
      id: "promo-1",
      type: "PRODUCT_DISCOUNT",
      title: "Sale",
      subtitle: "Today",
      badge: "-10%",
      discountPercent: 10,
      minQuantity: 1,
      active: true,
      productIds: ["prod-1"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        title: "Phone",
        description: "Desc",
        details: null,
        price: 1000,
        stock: 2,
        image: "/phone.png",
        galleryImages: [],
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Phones", image: null, createdAt: new Date() },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const response = await request(createApp()).get("/api/promotions/active");

    expect(response.status).toBe(200);
    expect(response.body.promotion.title).toBe("Sale");
    expect(response.body.promotion.products).toHaveLength(1);
  });
});
