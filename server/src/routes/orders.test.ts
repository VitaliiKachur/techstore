import { Role } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createToken } from "../lib/jwt";
import { prismaMock } from "../test/prisma-mock";
import { createApp } from "../app";

describe("orders routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication", async () => {
    const response = await request(createApp()).get("/api/orders");

    expect(response.status).toBe(401);
  });

  it("returns customer orders", async () => {
    const token = createToken({ userId: "user-1", role: Role.USER });
    prismaMock.order.findMany.mockResolvedValue([]);

    const response = await request(createApp())
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.orders).toEqual([]);
  });

  it("rejects empty order payload", async () => {
    const token = createToken({ userId: "user-1", role: Role.USER });

    const response = await request(createApp())
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Order must contain at least one item");
  });

  it("allows admins to update order status", async () => {
    const token = createToken({ userId: "admin-1", role: Role.ADMIN });
    prismaMock.order.update.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      totalPrice: 1000,
      status: "PAID",
      createdAt: new Date(),
      items: [],
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });

    const response = await request(createApp())
      .patch("/api/orders/order-1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "PAID" });

    expect(response.status).toBe(200);
    expect(response.body.order.status).toBe("PAID");
  });
});
