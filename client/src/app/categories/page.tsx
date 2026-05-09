import CategoryBrowser from "@/components/CategoryBrowser";
import SiteHeader from "@/components/SiteHeader";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Категорії
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Обери розділ магазину
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Натисни на категорію, і ми відкриємо сторінку товарів тільки з цього розділу.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <CategoryBrowser />
      </section>
    </main>
  );
}
