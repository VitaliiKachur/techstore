"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AuthUser,
  clearAuthToken,
  getAuthToken,
  loadCurrentUser,
} from "@/lib/auth";
import { getCartItems, getCartSummary, subscribeToCartUpdates } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/categories", label: "Категорії" },
  { href: "/products", label: "Товари" },
  { href: "/products?promotion=active", label: "Акції" },
  { href: "/#delivery", label: "Доставка" },
];

export default function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartQuantity = useSyncExternalStore(
    subscribeToCartUpdates,
    getCartQuantity,
    getEmptyCartQuantity
  );

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
    setMobileMenuOpen(false);
    router.push("/login");
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
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
          <Link className="transition hover:text-[var(--text)]" href="/products?promotion=active">
            Акції
          </Link>
          <Link className="transition hover:text-[var(--text)]" href="/#delivery">
            Доставка
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link
                  className="hidden h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-bold transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] lg:inline-flex"
                  href="/admin"
                >
                  Адмін
                </Link>
              ) : null}
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
              className="hidden h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-bold transition hover:border-[var(--text)] sm:inline-flex sm:px-4"
              href="/login"
            >
              Увійти
            </Link>
          )}
          <Link
            className="inline-flex h-9 shrink-0 items-center rounded-md bg-[var(--text)] px-2.5 text-xs font-bold text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] sm:h-10 sm:px-4 sm:text-sm"
            href="/cart"
          >
            Кошик
            {cartQuantity > 0 ? (
              <span className="ml-1.5 grid min-w-[18px] place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-black text-[#111827] sm:ml-2 sm:min-w-5 sm:px-1.5 sm:text-xs">
                {cartQuantity}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <button
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            className="inline-flex size-10 flex-col items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--accent)] md:hidden"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            <span
              className={`h-0.5 w-5 rounded-full bg-[var(--text)] transition ${
                mobileMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-[var(--text)] transition ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-[var(--text)] transition ${
                mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div
          className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[0_18px_45px_var(--shadow)] md:hidden"
          id="mobile-menu"
        >
          <nav className="mx-auto grid max-w-7xl gap-2 text-sm font-bold text-[var(--muted)]">
            {NAV_LINKS.map((item) => (
              <Link
                className="rounded-md px-3 py-3 transition hover:bg-[var(--page)] hover:text-[var(--text)]"
                href={item.href}
                key={item.href}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto mt-4 grid max-w-7xl gap-2 border-t border-[var(--border)] pt-4 text-sm font-bold">
            {user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link
                    className="rounded-md border border-[var(--border)] px-3 py-3 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                    href="/admin"
                    onClick={closeMobileMenu}
                  >
                    Адмін
                  </Link>
                ) : null}
                <Link
                  className="flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-3 transition hover:border-[var(--text)]"
                  href="/profile"
                  onClick={closeMobileMenu}
                >
                  {user.avatarUrl ? (
                    // Data URL avatars are user-provided, so we intentionally render a native img tag.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Аватар користувача"
                      className="size-8 rounded-full border border-[var(--border)] object-cover"
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-black text-[var(--accent-strong)]">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  Привіт, {user.name}
                </Link>
                <button
                  className="rounded-md border border-[var(--border)] px-3 py-3 text-left transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
                  onClick={handleLogout}
                  type="button"
                >
                  Вийти
                </button>
              </>
            ) : (
              <Link
                className="rounded-md border border-[var(--border)] px-3 py-3 transition hover:border-[var(--text)]"
                href="/login"
                onClick={closeMobileMenu}
              >
                Увійти
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function getCartQuantity() {
  return getCartSummary(getCartItems()).totalQuantity;
}

function getEmptyCartQuantity() {
  return 0;
}
