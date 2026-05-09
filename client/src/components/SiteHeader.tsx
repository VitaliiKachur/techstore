"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AuthUser,
  clearAuthToken,
  getAuthToken,
  loadCurrentUser,
} from "@/lib/auth";

export default function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function resolveUser() {
      if (!getAuthToken()) {
        setUser(null);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();
        setUser(currentUser);
      } catch {
        clearAuthToken();
        setUser(null);
      }
    }

    resolveUser();
  }, []);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid size-10 place-items-center rounded-lg bg-[var(--text)] text-lg font-black text-[var(--surface)]">
            T
          </span>
          <span className="text-xl font-black">TechStore</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
          <Link className="transition hover:text-[var(--text)]" href="/categories">
            Категорії
          </Link>
          <Link className="transition hover:text-[var(--text)]" href="/products">
            Товари
          </Link>
          <Link className="transition hover:text-[var(--text)]" href="/#delivery">
            Доставка
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                className="hidden h-10 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm font-bold transition hover:border-[var(--text)] sm:inline-flex"
                href="/profile"
              >
                {user.avatarUrl ? (
                  // Data URL avatars are user-provided, so we intentionally render a native img tag.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Аватар користувача"
                    className="size-7 rounded-full border border-[var(--border)] object-cover"
                    src={user.avatarUrl}
                  />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-black text-[var(--accent-strong)]">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                Привіт, {user.name}
              </Link>
              <button
                className="hidden h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--rose)] hover:text-[var(--rose)] sm:inline-flex"
                onClick={handleLogout}
                type="button"
              >
                Вийти
              </button>
            </>
          ) : (
            <Link
              className="hidden h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--text)] sm:inline-flex"
              href="/login"
            >
              Увійти
            </Link>
          )}
          <button className="h-10 rounded-md bg-[var(--text)] px-4 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
            Кошик
          </button>
        </div>
      </div>
    </header>
  );
}
