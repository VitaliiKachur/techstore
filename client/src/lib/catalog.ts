import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type Category = {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
};

export type ProductPayload = {
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
};

type CategoriesResponse = {
  categories: Category[];
};

type ProductsResponse = {
  products: Product[];
};

type ProductResponse = {
  product: Product;
};

type CategoryResponse = {
  category: Category;
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

function getAdminHeaders() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Токен відсутній.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function loadCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося завантажити категорії."));
  }

  const data = (await response.json()) as CategoriesResponse;
  return data.categories;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося створити категорію."));
  }

  const data = (await response.json()) as CategoryResponse;
  return data.category;
}

export async function loadProducts(filters: {
  categoryId?: string;
  search?: string;
  limit?: number;
} = {}): Promise<Product[]> {
  const params = new URLSearchParams({ limit: String(filters.limit ?? 50) });
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  const response = await fetch(`${API_URL}/api/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося завантажити товари."));
  }

  const data = (await response.json()) as ProductsResponse;
  return data.products;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося створити товар."));
  }

  const data = (await response.json()) as ProductResponse;
  return data.product;
}

export async function updateProduct(
  productId: string,
  payload: ProductPayload
): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${productId}`, {
    method: "PATCH",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося оновити товар."));
  }

  const data = (await response.json()) as ProductResponse;
  return data.product;
}

export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/products/${productId}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Не вдалося видалити товар."));
  }
}
