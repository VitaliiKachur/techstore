const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "techstore_token";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  deliveryAddress: string | null;
  deliveryPhone: string | null;
  createdAt: string;
};

type LoginResponse = {
  token: string;
};

type MeResponse = {
  user: AuthUser;
};

export async function loginByEmail(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Не вдалося увійти. Перевір email та пароль.");
  }

  const data = (await response.json()) as LoginResponse;
  setAuthToken(data.token);
}

export async function registerByEmail(
  name: string,
  email: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Не вдалося зареєструватися. Перевір введені дані.");
  }

  const data = (await response.json()) as LoginResponse;
  setAuthToken(data.token);
}

export async function loginWithGoogle(credential: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    throw new Error("Google-вхід не спрацював. Перевір налаштування OAuth.");
  }

  const data = (await response.json()) as LoginResponse;
  setAuthToken(data.token);
}

export async function loadCurrentUser(): Promise<AuthUser> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Токен відсутній.");
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Сесія неактивна. Увійди повторно.");
  }

  const data = (await response.json()) as MeResponse;
  return data.user;
}

export async function updateCurrentUser(payload: {
  name: string;
  avatarUrl: string | null;
  deliveryAddress: string | null;
  deliveryPhone: string | null;
}): Promise<AuthUser> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Токен відсутній.");
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Не вдалося оновити профіль.");
  }

  const data = (await response.json()) as MeResponse;
  return data.user;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}
