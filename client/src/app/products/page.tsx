import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import ProductsPageClient from "./ProductsPageClient";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Каталог товарів
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Товари TechStore
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Тут працюють фільтр за категоріями і пошук по товарах з бази даних.
          </p>
        </div>
      </section>

      <Suspense fallback={<p className="catalog-message mx-auto mt-10 max-w-7xl">Завантаження каталогу...</p>}>
        <ProductsPageClient />
      </Suspense>
    </main>
  );
}
