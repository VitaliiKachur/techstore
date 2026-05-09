"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { AuthUser, clearAuthToken, getAuthToken, loadCurrentUser } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();

      if (!token) {
        setError("Сесію не знайдено. Увійди в акаунт.");
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();
        setUser(currentUser);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити дані профілю.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    clearAuthToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">Особистий кабінет</p>
          <h1 className="mt-2 text-3xl font-black">Профіль користувача</h1>

          {isLoading ? <p className="mt-5 catalog-message">Завантаження профілю...</p> : null}

          {!isLoading && error ? (
            <div className="mt-5 space-y-3">
              <p className="catalog-message">{error}</p>
              <Link
                className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--accent)]"
                href="/login"
              >
                Перейти до входу
              </Link>
            </div>
          ) : null}

          {!isLoading && user ? (
            <div className="mt-5 space-y-3">
              <p>
                <span className="font-bold">Ім&apos;я:</span> {user.name}
              </p>
              <p>
                <span className="font-bold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-bold">Роль:</span> {user.role}
              </p>
              <p>
                <span className="font-bold">Дата реєстрації:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString("uk-UA")}
              </p>
              <button
                className="mt-3 inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
                onClick={handleLogout}
                type="button"
              >
                Вийти
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
