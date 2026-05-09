import StorefrontCatalog from "@/components/StorefrontCatalog";
import ThemeToggle from "@/components/ThemeToggle";

const stats = [
  { value: "24 міс.", label: "офіційної гарантії" },
  { value: "1-2 дні", label: "доставка Україною" },
  { value: "0%", label: "оплата частинами" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)] transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a className="flex items-center gap-3" href="#">
            <span className="grid size-10 place-items-center rounded-lg bg-[var(--text)] text-lg font-black text-[var(--surface)]">
              T
            </span>
            <span className="text-xl font-black">TechStore</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
            <a className="transition hover:text-[var(--text)]" href="#catalog">
              Каталог
            </a>
            <a className="transition hover:text-[var(--text)]" href="#deals">
              Товари
            </a>
            <a className="transition hover:text-[var(--text)]" href="#delivery">
              Доставка
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="hidden h-10 rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--text)] sm:block">
              Увійти
            </button>
            <button className="h-10 rounded-md bg-[var(--text)] px-4 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
              Кошик
            </button>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-black uppercase text-[var(--accent-strong)]">
              Нова колекція техніки
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              TechStore
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Інтернет-магазин електроніки з ноутбуками, смартфонами, моніторами та
              комплектуючими для роботи, навчання і геймінгу.
            </p>

            <a
              className="mt-8 flex min-h-12 w-fit items-center rounded-md bg-[var(--text)] px-6 text-base font-black text-[var(--surface)] transition hover:bg-[var(--rose)] hover:text-white"
              href="#deals"
            >
              Перейти до каталогу
            </a>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="border-l-2 border-[var(--accent)] pl-3">
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[430px]">
            <div className="absolute inset-0 rounded-lg bg-[var(--hero-panel)]" />
            <div className="absolute left-6 right-6 top-6 rounded-lg bg-[var(--surface)] p-5 shadow-2xl sm:left-10 sm:right-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--muted)]">Добірка дня</p>
                  <h2 className="text-2xl font-black">Робочий сетап</h2>
                </div>
                <span className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-black text-[var(--warning-strong)]">
                  -18%
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="device-scene device-scene-laptop" aria-label="Ноутбук" />
                <div className="grid gap-4">
                  <div className="device-scene device-scene-phone" aria-label="Смартфон" />
                  <div className="device-scene device-scene-watch" aria-label="Аксесуар" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/20 bg-white/10 p-5 text-white backdrop-blur sm:left-10 sm:right-10">
              <p className="text-sm font-bold text-white/70">Комплект від</p>
              <p className="mt-1 text-3xl font-black">67 990 грн</p>
            </div>
          </div>
        </div>
      </section>

      <StorefrontCatalog />

      <section id="delivery" className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-2xl font-black">Сервіс без зайвого шуму</h2>
          </div>
          <p className="leading-7 text-[var(--muted)]">
            Перевірені характеристики, чесна наявність і швидке оформлення замовлення
            через особистий кабінет.
          </p>
          <p className="leading-7 text-[var(--muted)]">
            Далі підключимо кошик, авторизацію і сторінку товару.
          </p>
        </div>
      </section>
    </main>
  );
}
