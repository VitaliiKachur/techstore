"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";

type Category = {
  id: string;
  name: string;
  _count: {
    products: number;
  };
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
};

type ProductsResponse = {
  products: Product[];
  meta: {
    total: number;
  };
};

type CategoriesResponse = {
  categories: Category[];
};

type ProductsCatalogProps = {
  initialCategoryId?: string;
  initialSearch?: string;
  title?: string;
  compactCategories?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function ProductsCatalog({
  initialCategoryId = "",
  initialSearch = "",
  title = "Підібрано для тебе",
  compactCategories = false,
}: ProductsCatalogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const totalProducts = useMemo(
    () => categories.reduce((sum, category) => sum + category._count.products, 0),
    [categories]
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/api/categories`);

        if (!response.ok) {
          throw new Error("Categories request failed");
        }

        const data = (await response.json()) as CategoriesResponse;
        setCategories(data.categories);
      } catch {
        setError("Не вдалося завантажити категорії. Перевір, чи запущений backend.");
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({ limit: compactCategories ? "8" : "12" });
      if (activeCategoryId) params.set("categoryId", activeCategoryId);
      if (search) params.set("search", search);

      try {
        const response = await fetch(`${API_URL}/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Products request failed");
        }

        const data = (await response.json()) as ProductsResponse;
        setProducts(data.products);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setProducts([]);
        setError("Не вдалося завантажити товари. Перевір, чи запущений backend.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [activeCategoryId, compactCategories, search]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <>
      <section id="catalog" className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
              Категорії
            </p>
            <h2 className="mt-2 text-3xl font-black">
              {compactCategories ? "Живий каталог" : "Фільтр товарів"}
            </h2>
          </div>
          <Link
            className="text-sm font-black text-[var(--text)] underline decoration-[var(--accent)] decoration-4 underline-offset-4"
            href="/categories"
          >
            Сторінка категорій
          </Link>
        </div>

        <div className={`grid gap-4 ${compactCategories ? "md:grid-cols-3 xl:grid-cols-6" : "md:grid-cols-3 xl:grid-cols-6"}`}>
          <button
            className={`category-chip ${activeCategoryId === "" ? "category-chip-active" : ""}`}
            onClick={() => setActiveCategoryId("")}
            type="button"
          >
            <span>Усі товари</span>
            <small>{totalProducts || products.length} позицій</small>
          </button>

          {categories.map((category) => (
            <button
              className={`category-chip ${
                activeCategoryId === category.id ? "category-chip-active" : ""
              }`}
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              type="button"
            >
              <span>{category.name}</span>
              <small>{category._count.products} товарів</small>
            </button>
          ))}
        </div>
      </section>

      <section id="deals" className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_420px] md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--rose)]">Товари</p>
            <h2 className="mt-2 text-3xl font-black">{title}</h2>
          </div>

          <form className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" onSubmit={handleSearch}>
            <input
              className="min-h-11 flex-1 rounded-md bg-[var(--page)] px-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-[var(--muted-soft)] focus:ring-2 focus:ring-[var(--accent)]"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Пошук у каталозі"
              type="search"
              value={searchInput}
            />
            <button className="min-h-11 rounded-md bg-[var(--text)] px-4 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]" type="submit">
              Знайти
            </button>
          </form>
        </div>

        {error ? <p className="catalog-message">{error}</p> : null}

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="product-skeleton" key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <p className="catalog-message">За цим запитом товарів не знайдено.</p>
        ) : null}

        {!isLoading && products.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                className="product-card rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                key={product.id}
              >
                <ProductImage alt={product.title} src={product.image} />
                <div className="p-5">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    {product.category.name}
                  </p>
                  <h3 className="mt-2 min-h-14 text-xl font-black leading-7">
                    <Link className="transition hover:text-[var(--accent-strong)]" href={`/products/${product.id}`}>
                      {product.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--muted)]">
                    {product.description}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[var(--accent-strong)]">
                    {product.stock > 0 ? `В наявності: ${product.stock}` : "Немає в наявності"}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-2xl font-black">{formatPrice(product.price)}</p>
                    <div className="flex gap-2">
                      <Link
                        className="inline-flex h-11 items-center rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)]"
                        href={`/products/${product.id}`}
                      >
                        Деталі
                      </Link>
                      <AddToCartButton
                        className="inline-flex h-11 items-center rounded-md bg-[var(--text)] px-4 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                        product={{
                          id: product.id,
                          title: product.title,
                          price: product.price,
                          stock: product.stock,
                          image: product.image,
                          categoryName: product.category.name,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
