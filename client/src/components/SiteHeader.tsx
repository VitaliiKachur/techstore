import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
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
          <Link
            className="hidden h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--text)] sm:inline-flex"
            href="/login"
          >
            Увійти
          </Link>
          <Link
            className="hidden h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--text)] sm:inline-flex"
            href="/profile"
          >
            Профіль
          </Link>
          <button className="h-10 rounded-md bg-[var(--text)] px-4 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
            Кошик
          </button>
        </div>
      </div>
    </header>
  );
}
