import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCustomerOrder,
  getOrderStatusLabel,
  isCompletedOrder,
  loadCustomerOrders,
  updateOrderStatus,
} from "./orders";

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(() => "user-token"),
}));

const order = {
  id: "order-1",
  totalPrice: 1000,
  status: "PENDING" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  items: [],
};

function mockJsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("orders api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads orders with optional filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ orders: [order] }));

    await expect(loadCustomerOrders({ status: "PENDING", search: " admin " })).resolves.toEqual([
      order,
    ]);

    expect(String(fetchMock.mock.calls[0][0])).toContain("status=PENDING");
    expect(String(fetchMock.mock.calls[0][0])).toContain("search=admin");
  });

  it("creates orders and updates status", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ order }));

    await expect(createCustomerOrder([{ productId: "product-1", quantity: 2 }])).resolves.toEqual(
      order
    );
    await expect(updateOrderStatus("order-1", "PAID")).resolves.toEqual(order);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5000/api/orders/order-1/status",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("maps status helpers", () => {
    expect(isCompletedOrder("DELIVERED")).toBe(true);
    expect(isCompletedOrder("PAID")).toBe(false);
    expect(getOrderStatusLabel("SHIPPED")).toBe("Доставлено");
  });

  it("throws API error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      mockJsonResponse({ message: "Order failed" }, false)
    );

    await expect(createCustomerOrder([])).rejects.toThrow("Order failed");
  });
});
