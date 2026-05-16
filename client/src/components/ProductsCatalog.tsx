"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";
import {
  Promotion,
  getPromotionalPrice,
  loadActivePromotion,
} from "@/lib/promotions";

type Category = {
  id: string;
  name: string;
  image: string | null;
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
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CategoriesResponse = {
  categories: Category[];
};

type ProductsCatalogProps = {
  initialCategoryId?: string;
  initialFocusProductId?: string;
  initialMaxPrice?: string;
  initialMinPrice?: string;
  initialPage?: number;
  initialPromotionOnly?: boolean;
  initialSearch?: string;
  title?: string;
  compactCategories?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PRODUCTS_PER_PAGE = 12;
const COMPACT_PRODUCTS_LIMIT = 8;
const CATALOG_POSITION_KEY = "techstore_catalog_position";

export default function ProductsCatalog({
  initialCategoryId = "",
  initialFocusProductId = "",
  initialMaxPrice = "",
  initialMinPrice = "",
  initialPage = 1,
  initialPromotionOnly = false,
  initialSearch = "",
  title = "Підібрано для тебе",
  compactCategories = false,
}: ProductsCatalogProps) {
  const savedCatalogPosition = useMemo(() => readSavedCatalogPosition(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [promotionOnly, setPromotionOnly] = useState(initialPromotionOnly);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [minPriceInput, setMinPriceInput] = useState(initialMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(initialMaxPrice);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFound, setTotalFound] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const shouldScrollToProducts = useRef(false);
  const focusProductId = useRef(
    compactCategories ? "" : initialFocusProductId || savedCatalogPosition.productId || ""
  );
  const totalProducts = useMemo(
    () => categories.reduce((sum, category) => sum + category._count.products, 0),
    [categories]
  );

  const buildCatalogUrl = useCallback(
    (nextPage: number, productId = "") => {
      const params = new URLSearchParams();
      const activeCategory = categories.find((category) => category.id === activeCategoryId);

      if (activeCategoryId && !promotionOnly) {
        params.set("categoryId", activeCategoryId);
      }

      if (activeCategory?.name && !promotionOnly) {
        params.set("category", activeCategory.name);
      }

      if (promotionOnly) {
        params.set("promotion", "active");
      }

      if (search) {
        params.set("name", search);
      }

      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      }

      if (productId) {
        params.set("focusProduct", productId);
      }

      const query = params.toString();
      return query ? `/products?${query}` : "/products";
    },
    [activeCategoryId, categories, maxPrice, minPrice, promotionOnly, search]
  );

  const replaceCatalogUrl = useCallback(
    (nextPage: number, productId = "") => {
      if (compactCategories) {
        return;
      }

      window.history.replaceState(null, "", buildCatalogUrl(nextPage, productId));
    },
    [buildCatalogUrl, compactCategories]
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const [response, activePromotion] = await Promise.all([
          fetch(`${API_URL}/api/categories`),
          loadActivePromotion().catch(() => null),
        ]);

        if (!response.ok) {
          throw new Error("Categories request failed");
        }

        const data = (await response.json()) as CategoriesResponse;
        setCategories(data.categories);
        setPromotion(activePromotion);
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

      const params = new URLSearchParams({
        limit: String(compactCategories ? COMPACT_PRODUCTS_LIMIT : PRODUCTS_PER_PAGE),
        page: String(page),
      });
      if (activeCategoryId && !promotionOnly) params.set("categoryId", activeCategoryId);
      if (promotionOnly) params.set("promotion", "active");
      if (search) params.set("name", search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      try {
        const response = await fetch(`${API_URL}/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Products request failed");
        }

        const data = (await response.json()) as ProductsResponse;
        setProducts(data.products);
        setTotalPages(Math.max(data.meta.totalPages, 1));
        setTotalFound(data.meta.total);

        if (focusProductId.current) {
          window.setTimeout(() => {
            document
              .getElementById(`product-${focusProductId.current}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
            focusProductId.current = "";
            window.sessionStorage.removeItem(CATALOG_POSITION_KEY);
            replaceCatalogUrl(page);
          }, 0);
        } else if (shouldScrollToProducts.current) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          shouldScrollToProducts.current = false;
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setProducts([]);
        setTotalPages(1);
        setTotalFound(0);
        setError("Не вдалося завантажити товари. Перевір, чи запущений backend.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [
    activeCategoryId,
    compactCategories,
    maxPrice,
    minPrice,
    page,
    promotionOnly,
    replaceCatalogUrl,
    search,
  ]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    const nextMinPrice = normalizePriceFilter(minPriceInput);
    const nextMaxPrice = normalizePriceFilter(maxPriceInput);

    setPage(1);
    setSearch(nextSearch);
    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);
    setMinPriceInput(nextMinPrice);
    setMaxPriceInput(nextMaxPrice);
  }

  function resetFilters() {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice("");
    setMaxPrice("");
  }

  function changePage(nextPage: number) {
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);

    if (normalizedPage !== page) {
      shouldScrollToProducts.current = true;
      replaceCatalogUrl(normalizedPage);
      setPage(normalizedPage);
    }
  }

  function rememberCatalogPosition(productId: string) {
    window.sessionStorage.setItem(
      CATALOG_POSITION_KEY,
      JSON.stringify({ page, productId })
    );
    replaceCatalogUrl(page);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    }).format(price);
  }

  const hasActiveFilters = Boolean(search || minPrice || maxPrice);

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
            className={`category-chip ${
              activeCategoryId === "" && !promotionOnly ? "category-chip-active" : ""
            }`}
            onClick={() => {
              setPromotionOnly(false);
              setActiveCategoryId("");
              setPage(1);
            }}
            type="button"
          >
            <span>Усі товари</span>
            <small>{totalProducts || products.length} позицій</small>
          </button>

          <button
            className={`category-chip ${promotionOnly ? "category-chip-active" : ""}`}
            onClick={() => {
              setPromotionOnly(true);
              setActiveCategoryId("");
              setPage(1);
            }}
            type="button"
          >
            <span>Акції</span>
            <small>{promotion?.productIds.length ?? 0} товарів</small>
          </button>

          {categories.map((category) => (
            <button
              className={`category-chip ${
                activeCategoryId === category.id && !promotionOnly ? "category-chip-active" : ""
              }`}
              key={category.id}
              onClick={() => {
                setPromotionOnly(false);
                setActiveCategoryId(category.id);
                setPage(1);
              }}
              type="button"
            >
              {category.image ? (
                <span
                  aria-hidden="true"
                  className="category-chip__thumb"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
              ) : null}
              <span>{category.name}</span>
              <small>{category._count.products} товарів</small>
            </button>
          ))}
        </div>
      </section>

      <section id="deals" className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_minmax(0,700px)] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--rose)]">Товари</p>
            <h2 className="mt-2 text-3xl font-black">{title}</h2>
          </div>

          <form
            className="grid min-w-0 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 sm:grid-cols-[minmax(150px,1fr)_minmax(88px,120px)_minmax(88px,120px)_minmax(82px,auto)_minmax(88px,auto)]"
            onSubmit={handleSearch}
          >
            <input
              className="min-h-11 flex-1 rounded-md bg-[var(--page)] px-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-[var(--muted-soft)] focus:ring-2 focus:ring-[var(--accent)]"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Пошук у каталозі"
              type="search"
              value={searchInput}
            />
            <input
              className="min-h-11 rounded-md bg-[var(--page)] px-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-[var(--muted-soft)] focus:ring-2 focus:ring-[var(--accent)]"
              min="0"
              onChange={(event) => setMinPriceInput(event.target.value)}
              placeholder="Ціна від"
              type="number"
              value={minPriceInput}
            />
            <input
              className="min-h-11 rounded-md bg-[var(--page)] px-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-[var(--muted-soft)] focus:ring-2 focus:ring-[var(--accent)]"
              min="0"
              onChange={(event) => setMaxPriceInput(event.target.value)}
              placeholder="Ціна до"
              type="number"
              value={maxPriceInput}
            />
            <button className="min-h-11 rounded-md bg-[var(--text)] px-4 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]" type="submit">
              Знайти
            </button>
            <button
              className="min-h-11 rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
              type="button"
            >
              Скинути
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
          <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
              const promotionalPrice = promotion?.productIds.includes(product.id)
                ? getPromotionalPrice(product.price, promotion)
                : null;
              const productHref = `/products/${product.id}?returnTo=${encodeURIComponent(
                buildCatalogUrl(page, product.id)
              )}`;

              return (
              <article
                className="product-card rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                id={`product-${product.id}`}
                key={product.id}
              >
                <ProductImage alt={product.title} src={product.image} />
                <div className="p-5">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    {product.category.name}
                  </p>
                  <h3 className="mt-2 min-h-14 break-words text-xl font-black leading-7">
                    <Link
                      className="transition hover:text-[var(--accent-strong)]"
                      href={productHref}
                      onClick={() => rememberCatalogPosition(product.id)}
                    >
                      {product.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--muted)]">
                    {product.description}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[var(--accent-strong)]">
                    {product.stock > 0 ? `В наявності: ${product.stock}` : "Немає в наявності"}
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="min-w-0">
                      {promotionalPrice !== null ? (
                        <p className="text-sm font-black text-[var(--muted)] line-through">
                          {formatPrice(product.price)}
                        </p>
                      ) : null}
                      <p className="break-words text-2xl font-black">
                        {formatPrice(promotionalPrice ?? product.price)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        className="inline-flex h-11 min-w-0 items-center justify-center rounded-md border border-[var(--border)] px-3 text-center text-sm font-black transition hover:border-[var(--accent)]"
                        href={productHref}
                        onClick={() => rememberCatalogPosition(product.id)}
                      >
                        Деталі
                      </Link>
                      <AddToCartButton
                        className="inline-flex h-11 min-w-0 items-center justify-center rounded-md bg-[var(--text)] px-3 text-center text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
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
              );
            })}
          </div>

          {!compactCategories && totalPages > 1 ? (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row">
              <p className="text-sm font-bold text-[var(--muted)]">
                Сторінка {page} з {totalPages}. Знайдено товарів: {totalFound}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                  type="button"
                >
                  Назад
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      className={`h-10 min-w-10 rounded-md border px-3 text-sm font-black transition ${
                        pageNumber === page
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[#111827]"
                          : "border-[var(--border)] hover:border-[var(--accent)]"
                      }`}
                      key={pageNumber}
                      onClick={() => changePage(pageNumber)}
                      type="button"
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                  type="button"
                >
                  Далі
                </button>
              </div>
            </div>
          ) : null}
          </>
        ) : null}
      </section>
    </>
  );
}

function readSavedCatalogPosition(): { productId?: string } {
  if (typeof window === "undefined") {
    return {};
  }

  const savedPosition = window.sessionStorage.getItem(CATALOG_POSITION_KEY);

  if (!savedPosition) {
    return {};
  }

  try {
    const parsed = JSON.parse(savedPosition) as { productId?: string };

    return {
      productId: typeof parsed.productId === "string" ? parsed.productId : undefined,
    };
  } catch {
    window.sessionStorage.removeItem(CATALOG_POSITION_KEY);
    return {};
  }
}

function normalizePriceFilter(value: string): string {
  if (!value.trim()) {
    return "";
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : "";
}
