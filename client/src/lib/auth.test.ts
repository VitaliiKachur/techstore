import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthToken,
  getAuthToken,
  loadCurrentUser,
  loginByEmail,
  loginWithGoogle,
  registerByEmail,
  setAuthToken,
  updateCurrentUser,
} from "./auth";

const user = {
  id: "user-1",
  name: "Admin",
  email: "admin@techstore.local",
  role: "ADMIN",
  avatarUrl: null,
  deliveryAddress: null,
  deliveryPhone: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function mockJsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("auth api client", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and clears auth token", () => {
    setAuthToken("token-1");
    expect(getAuthToken()).toBe("token-1");

    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  it("logs in, registers and handles Google auth", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ token: "token-1" }));

    await loginByEmail("admin@techstore.local", "password");
    await registerByEmail("Admin", "admin@techstore.local", "password");
    await loginWithGoogle("google-token");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAuthToken()).toBe("token-1");
  });

  it("loads and updates current user with bearer token", async () => {
    setAuthToken("token-1");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ user }));

    await expect(loadCurrentUser()).resolves.toEqual(user);
    await expect(
      updateCurrentUser({
        name: "Admin",
        avatarUrl: null,
        deliveryAddress: "Kyiv",
        deliveryPhone: "+380000000000",
      })
    ).resolves.toEqual(user);

    expect(fetchMock).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/auth/me",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
      })
    );
  });

  it("throws helpful errors for missing token and failed requests", async () => {
    await expect(loadCurrentUser()).rejects.toThrow("Токен відсутній.");

    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      mockJsonResponse({ message: "Bad credentials" }, false)
    );

    await expect(loginByEmail("bad@example.com", "wrong")).rejects.toThrow(
      "Bad credentials"
    );
  });
});
