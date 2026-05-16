import { Role } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { createToken, verifyToken } from "./jwt";

describe("jwt helpers", () => {
  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("creates and verifies role-aware tokens", () => {
    process.env.JWT_SECRET = "test-secret";

    const token = createToken({ userId: "user-1", role: Role.ADMIN });

    expect(verifyToken(token)).toEqual({ userId: "user-1", role: Role.ADMIN });
  });

  it("rejects invalid token payloads", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = jwt.sign({ userId: "user-1", role: "OWNER" }, "test-secret");

    expect(() => verifyToken(token)).toThrow("Invalid token payload");
  });

  it("requires JWT_SECRET", () => {
    expect(() => createToken({ userId: "user-1", role: Role.USER })).toThrow(
      "JWT_SECRET is not configured"
    );
  });
});
