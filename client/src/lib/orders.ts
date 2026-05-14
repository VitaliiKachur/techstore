import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";

export type OrderProduct = {
  id: string;
  title: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
};

export type OrderItem = {
  id: string;
  quantity: number;
  product: OrderProduct;
};

export type CustomerOrder = {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

type OrdersResponse = {
  orders: CustomerOrder[];
};

type OrderResponse = {
  order: CustomerOrder;
};

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    // ignore invalid JSON
  }

  return fallback;
}

export async function loadCustomerOrders(): Promise<CustomerOrder[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Токен відсутній.");
  }

  const response = await fetch(`${API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, "Не вдалося завантажити замовлення.")
    );
  }

  const data = (await response.json()) as OrdersResponse;
  return data.orders;
}

export async function createCustomerOrder(
  items: Array<{ productId: string; quantity: number }>
): Promise<CustomerOrder> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("РўРѕРєРµРЅ РІС–РґСЃСѓС‚РЅС–Р№.");
  }

  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, "РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё Р·Р°РјРѕРІР»РµРЅРЅСЏ.")
    );
  }

  const data = (await response.json()) as OrderResponse;
  return data.order;
}

export function isCompletedOrder(status: OrderStatus) {
  return status === "DELIVERED";
}

export function getOrderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Очікує оплати",
    PAID: "Оплачено",
    SHIPPED: "В дорозі",
    DELIVERED: "Завершено",
  };

  return labels[status];
}
