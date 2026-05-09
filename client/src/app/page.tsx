const categories = [
  { name: "Ноутбуки", count: "48 моделей" },
  { name: "Смартфони", count: "64 моделі" },
  { name: "Монітори", count: "32 моделі" },
  { name: "Комплектуючі", count: "91 товар" },
];

const products = [
  {
    title: "MacBook Air 13 M3",
    category: "Ноутбуки",
    price: "49 999 грн",
    oldPrice: "54 999 грн",
    stock: "Є в наявності",
    accent: "mint",
  },
  {
    title: "Samsung Galaxy S25",
    category: "Смартфони",
    price: "39 499 грн",
    oldPrice: "42 999 грн",
    stock: "Швидка доставка",
    accent: "coral",
  },
  {
    title: "LG UltraGear 27",
    category: "Монітори",
    price: "13 899 грн",
    oldPrice: "15 299 грн",
    stock: "Топ продажів",
    accent: "cyan",
  },
  {
    title: "Logitech MX Keys S",
    category: "Аксесуари",
    price: "4 299 грн",
    oldPrice: "4 999 грн",
    stock: "Новинка",
    accent: "amber",
  },
];

const stats = [
  { value: "24 міс.", label: "офіційної гарантії" },
  { value: "1-2 дні", label: "доставка Україною" },
  { value: "0%", label: "оплата частинами" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a className="flex items-center gap-3" href="#">
            <span className="grid size-10 place-items-center rounded-lg bg-[#111827] text-lg font-black text-white">
              T
            </span>
            <span className="text-xl font-black">TechStore</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#4b5563] md:flex">
            <a className="transition hover:text-[#111827]" href="#catalog">
              Каталог
            </a>
            <a className="transition hover:text-[#111827]" href="#deals">
              Акції
            </a>
            <a className="transition hover:text-[#111827]" href="#delivery">
              Доставка
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden h-10 rounded-md border border-black/10 px-4 text-sm font-bold transition hover:border-[#111827] sm:block">
              Увійти
            </button>
            <button className="h-10 rounded-md bg-[#111827] px-4 text-sm font-bold text-white transition hover:bg-[#2dd4bf] hover:text-[#111827]">
              Кошик
            </button>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-md bg-[#ccfbf1] px-3 py-2 text-sm font-black uppercase text-[#115e59]">
              Нова колекція техніки
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] text-[#111827] sm:text-6xl lg:text-7xl">
              TechStore
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4b5563]">
              Інтернет-магазин електроніки з ноутбуками, смартфонами, моніторами та
              комплектуючими для роботи, навчання і геймінгу.
            </p>

            <form className="mt-8 flex max-w-2xl flex-col gap-3 rounded-lg border border-black/10 bg-[#f9fafb] p-2 sm:flex-row">
              <input
                className="min-h-12 flex-1 rounded-md bg-white px-4 text-base outline-none ring-1 ring-black/10 transition placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2dd4bf]"
                placeholder="Пошук ноутбука, смартфона або аксесуара"
                type="search"
              />
              <button className="min-h-12 rounded-md bg-[#111827] px-6 text-base font-black text-white transition hover:bg-[#fb7185]">
                Знайти
              </button>
            </form>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="border-l-2 border-[#2dd4bf] pl-3">
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-[#6b7280]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[430px]">
            <div className="absolute inset-0 rounded-lg bg-[#111827]" />
            <div className="absolute left-6 right-6 top-6 rounded-lg bg-white p-5 shadow-2xl sm:left-10 sm:right-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#6b7280]">Добірка дня</p>
                  <h2 className="text-2xl font-black">Робочий сетап</h2>
                </div>
                <span className="rounded-md bg-[#fef3c7] px-3 py-2 text-sm font-black text-[#92400e]">
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

      <section id="catalog" className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[#0f766e]">Категорії</p>
            <h2 className="mt-2 text-3xl font-black">Швидкий вибір</h2>
          </div>
          <a className="text-sm font-black text-[#111827] underline decoration-[#2dd4bf] decoration-4 underline-offset-4" href="#deals">
            Перейти до акцій
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <a
              className="rounded-lg border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:border-[#2dd4bf] hover:shadow-lg"
              href="#deals"
              key={category.name}
            >
              <p className="text-xl font-black">{category.name}</p>
              <p className="mt-2 text-sm font-semibold text-[#6b7280]">{category.count}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="deals" className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-[#be123c]">Популярне</p>
          <h2 className="mt-2 text-3xl font-black">Товари, які шукають зараз</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article className="product-card rounded-lg border border-black/10 bg-white" key={product.title}>
              <div className={`product-visual product-visual-${product.accent}`}>
                <div className="product-device" />
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-[#6b7280]">{product.category}</p>
                <h3 className="mt-2 min-h-14 text-xl font-black leading-7">{product.title}</h3>
                <p className="mt-3 text-sm font-bold text-[#0f766e]">{product.stock}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black">{product.price}</p>
                    <p className="text-sm font-semibold text-[#9ca3af] line-through">
                      {product.oldPrice}
                    </p>
                  </div>
                  <button className="h-11 rounded-md bg-[#111827] px-4 text-sm font-black text-white transition hover:bg-[#2dd4bf] hover:text-[#111827]">
                    Купити
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="delivery" className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-2xl font-black">Сервіс без зайвого шуму</h2>
          </div>
          <p className="leading-7 text-[#4b5563]">
            Перевірені характеристики, чесна наявність і швидке оформлення замовлення
            через особистий кабінет.
          </p>
          <p className="leading-7 text-[#4b5563]">
            Далі підключимо живі товари з API, кошик, авторизацію і сторінку товару.
          </p>
        </div>
      </section>
    </main>
  );
}
