import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import SiteHeader from "@/components/SiteHeader";
import StorefrontCatalog from "@/components/StorefrontCatalog";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type HomePromotion = {
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  products: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
  }>;
};

const stats = [
  { value: "24 міс.", label: "офіційної гарантії" },
  { value: "1-2 дні", label: "доставка Україною" },
  { value: "0%", label: "оплата частинами" },
];

export default async function Home() {
  const promotion = await loadActivePromotion();
  const heroProducts = promotion?.products.slice(0, 3) ?? [];
  const heroTotal = heroProducts.reduce((sum, product) => sum + product.price, 0);
  const heroDiscount = promotion
    ? Math.round(heroTotal * (promotion.discountPercent / 100))
    : 0;
  const heroPrice = heroProducts.length > 0 ? Math.max(0, heroTotal - heroDiscount) : 67990;
  const promotionHref = promotion ? "/products?promotion=active" : "/products";
  const promotionRule = promotion
    ? `Знижка ${promotion.discountPercent}% на товари з добірки`
    : null;

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)] transition-colors duration-300">
      <SiteHeader />

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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="flex min-h-12 w-fit items-center rounded-md bg-[var(--text)] px-6 text-base font-black text-[var(--surface)] transition hover:bg-[var(--rose)] hover:text-white"
                href="/categories"
              >
                Обрати категорію
              </Link>
              <Link
                className="flex min-h-12 w-fit items-center rounded-md border border-[var(--border)] px-6 text-base font-black transition hover:border-[var(--accent)]"
                href="/products"
              >
                Усі товари
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="border-l-2 border-[var(--accent)] pl-3">
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[var(--hero-panel)]" />
            <Link
              className="relative z-10 mx-auto block overflow-hidden rounded-lg border border-white/10 bg-[var(--surface)] p-5 shadow-2xl transition hover:-translate-y-1 hover:border-[var(--accent)] sm:p-6"
              href={promotionHref}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    {promotion?.subtitle ?? "Добірка дня"}
                  </p>
                  <h2 className="mt-1 text-3xl font-black leading-tight">
                    {promotion?.title ?? "Робочий сетап"}
                  </h2>
                  {promotionRule ? (
                    <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                      {promotionRule}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-black text-[var(--warning-strong)]">
                  {promotion?.badge ?? "-18%"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.25fr_0.75fr]">
                <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--page)]">
                  {heroProducts[0] ? (
                    <ProductImage
                      alt={heroProducts[0].title}
                      className="min-h-[330px]"
                      src={heroProducts[0].image}
                    />
                  ) : (
                    <div className="device-scene device-scene-laptop min-h-[330px]" aria-label="Ноутбук" />
                  )}
                  <div className="border-t border-[var(--border)] p-4">
                    <p className="line-clamp-1 text-sm font-black">
                      {heroProducts[0]?.title ?? "Головний товар акції"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[heroProducts[1], heroProducts[2]].map((product, index) => (
                    <div
                      className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--page)]"
                      key={product?.id ?? index}
                    >
                      {product ? (
                        <ProductImage
                          alt={product.title}
                          className="min-h-[137px]"
                          src={product.image}
                        />
                      ) : (
                        <div
                          className={`device-scene ${
                            index === 0 ? "device-scene-phone" : "device-scene-watch"
                          } min-h-[137px]`}
                          aria-label={index === 0 ? "Смартфон" : "Аксесуар"}
                        />
                      )}
                      <div className="border-t border-[var(--border)] px-3 py-2">
                        <p className="line-clamp-1 text-xs font-black">
                          {product?.title ?? (index === 0 ? "Товар акції" : "Ще один товар")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black text-[var(--rose)]">
                    {promotion ? `Економія ${formatPrice(heroDiscount)}` : "Акційна добірка"}
                  </p>
                  <p className="mt-1 text-3xl font-black">{formatPrice(heroPrice)}</p>
                </div>
                <span className="text-sm font-black text-[var(--accent-strong)]">
                  Дивитися акційні товари
                </span>
              </div>
            </Link>
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
            Кошик, авторизація, профіль і сторінки товарів працюють як єдина система для покупця.
          </p>
        </div>
      </section>
    </main>
  );
}

async function loadActivePromotion(): Promise<HomePromotion | null> {
  try {
    const response = await fetch(`${API_URL}/api/promotions/active`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { promotion?: HomePromotion | null };
    return data.promotion ?? null;
  } catch {
    return null;
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}
