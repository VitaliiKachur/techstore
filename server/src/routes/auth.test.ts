import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createToken } from "../lib/jwt";
import { prismaMock } from "../test/prisma-mock";
import { createApp } from "../app";

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates register payload", async () => {
    const response = await request(createApp()).post("/api/auth/register").send({
      name: "",
      email: "user@example.com",
      password: "secret",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Name, email and password are required");
  });

  it("validates short passwords", async () => {
    const response = await request(createApp()).post("/api/auth/register").send({
      name: "User",
      email: "user@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Password must contain at least 6 characters");
  });

  it("requires auth for profile endpoint", async () => {
    const response = await request(createApp()).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("registers a user", async () => {
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      role: "USER",
      avatarUrl: null,
      deliveryAddress: null,
      deliveryPhone: null,
      createdAt: new Date(),
    });

    const response = await request(createApp()).post("/api/auth/register").send({
      name: "User",
      email: "user@example.com",
      password: "secret12",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTypeOf("string");
    expect(response.body.user.email).toBe("user@example.com");
  });

  it("rejects invalid login credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(createApp()).post("/api/auth/login").send({
      email: "user@example.com",
      password: "secret12",
    });

    expect(response.status).toBe(401);
  });

  it("logs in with valid credentials", async () => {
    const passwordHash = await bcrypt.hash("secret12", 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      role: Role.USER,
      password: passwordHash,
      avatarUrl: null,
      deliveryAddress: null,
      deliveryPhone: null,
      createdAt: new Date(),
    });

    const response = await request(createApp()).post("/api/auth/login").send({
      email: "user@example.com",
      password: "secret12",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf("string");
  });

  it("returns current user profile", async () => {
    const token = createToken({ userId: "user-1", role: Role.USER });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      role: Role.USER,
      avatarUrl: null,
      deliveryAddress: null,
      deliveryPhone: null,
      createdAt: new Date(),
    });

    const response = await request(createApp())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("user@example.com");
  });
});
