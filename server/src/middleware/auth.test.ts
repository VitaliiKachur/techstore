import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin, requireAuth, type AuthenticatedRequest } from "./auth";
import { verifyToken } from "../lib/jwt";

vi.mock("../lib/jwt", () => ({
  verifyToken: vi.fn(),
}));

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing bearer tokens", () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches verified user and continues", () => {
    vi.mocked(verifyToken).mockReturnValue({ userId: "user-1", role: Role.ADMIN });
    const req = { headers: { authorization: "Bearer token-1" } };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect((req as AuthenticatedRequest).user).toEqual({
      userId: "user-1",
      role: Role.ADMIN,
    });
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid tokens", () => {
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error("bad token");
    });
    const req = { headers: { authorization: "Bearer bad-token" } };
    const res = createResponse();

    requireAuth(req as never, res as never, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });

  it("allows admins and rejects regular users", () => {
    const adminReq = { user: { userId: "admin-1", role: Role.ADMIN } };
    const userReq = { user: { userId: "user-1", role: Role.USER } };
    const adminNext = vi.fn();
    const userNext = vi.fn();
    const res = createResponse();

    requireAdmin(adminReq as never, res as never, adminNext);
    requireAdmin(userReq as never, res as never, userNext);

    expect(adminNext).toHaveBeenCalledOnce();
    expect(userNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
