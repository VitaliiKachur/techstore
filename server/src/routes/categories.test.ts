import { Role } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createToken } from "../lib/jwt";
import { prismaMock } from "../test/prisma-mock";
import { createApp } from "../app";

describe("categories routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists categories", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Смартфони",
        image: null,
        createdAt: new Date(),
        _count: { products: 2 },
      },
    ]);

    const response = await request(createApp()).get("/api/categories");

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(1);
  });

  it("requires auth to create a category", async () => {
    const response = await request(createApp())
      .post("/api/categories")
      .send({ name: "Ноутбуки" });

    expect(response.status).toBe(401);
  });

  it("validates category payload for admins", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });

    const response = await request(createApp())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Category name is required");
  });

  it("creates a category for admins", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });
    prismaMock.category.create.mockResolvedValue({
      id: "cat-2",
      name: "Ноутбуки",
      image: null,
      createdAt: new Date(),
      _count: { products: 0 },
    });

    const response = await request(createApp())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ноутбуки" });

    expect(response.status).toBe(201);
    expect(response.body.category.name).toBe("Ноутбуки");
  });
});
