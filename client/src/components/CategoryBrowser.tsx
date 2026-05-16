"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/ProductImage";

type Category = {
  id: string;
  name: string;
  image: string | null;
  _count: {
    products: number;
  };
};

type CategoriesResponse = {
  categories: Category[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<Category[]>([]);
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
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="category-skeleton" key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="catalog-message">{error}</p>;
  }

  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Доступно зараз
          </p>
          <h2 className="mt-2 text-2xl font-black">{categories.length} категорій</h2>
        </div>
        <p className="text-sm font-bold text-[var(--muted)]">{totalProducts} товарів у базі</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            className="category-card"
            href={`/products?categoryId=${category.id}&category=${encodeURIComponent(category.name)}`}
            key={category.id}
          >
            {category.image ? (
              <ProductImage
                alt={category.name}
                className="category-card__image"
                src={category.image}
              />
            ) : (
              <span className="category-card__icon">{category.name.slice(0, 1)}</span>
            )}
            <span>
              <strong>{category.name}</strong>
              <small>{category._count.products} товарів</small>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
