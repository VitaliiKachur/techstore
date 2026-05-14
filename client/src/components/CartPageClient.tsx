"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import ProductImage from "@/components/ProductImage";
import {
  CartItem,
  clearCartItems,
  getCartItems,
  getCartSummary,
  removeCartItem,
  subscribeToCartUpdates,
  updateCartItemQuantity,
} from "@/lib/cart";

export default function CartPageClient() {
  const items = useSyncExternalStore(subscribeToCartUpdates, getCartItems, getEmptyCartItems);
  const summary = useMemo(() => getCartSummary(items), [items]);

  function handleQuantityChange(productId: string, quantity: number) {
    updateCartItemQuantity(productId, quantity);
  }

  function handleRemove(productId: string) {
    removeCartItem(productId);
  }

  function handleClearCart() {
    clearCartItems();
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Кошик
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Твої товари
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Перевір кількість, прибери зайве й підготуй замовлення до оформлення.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--accent)]"
          href="/products"
        >
          Продовжити покупки
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="grid gap-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-black">Кошик порожній</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Додай кілька товарів із каталогу, і вони з&apos;являться тут із
              ціною, кількістю та швидким керуванням.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]"
            href="/products"
          >
            До каталогу
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-[132px_1fr_auto]"
                key={item.product.id}
              >
                <ProductImage
                  alt={item.product.title}
                  className="min-h-[120px] rounded-md"
                  src={item.product.image}
                />

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                    {item.product.categoryName}
                  </p>
                  <Link
                    className="mt-1 block text-xl font-black transition hover:text-[var(--accent-strong)]"
                    href={`/products/${item.product.id}`}
                  >
                    {item.product.title}
                  </Link>
                  <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                    {formatPrice(item.product.price)} за одиницю
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Доступно: {item.product.stock}
                  </p>
                </div>

                <div className="flex flex-col justify-between gap-4 md:items-end">
                  <div className="inline-flex h-10 w-fit items-center rounded-md border border-[var(--border)] bg-[var(--page)]">
                    <button
                      aria-label="Зменшити кількість"
                      className="grid size-10 place-items-center text-lg font-black text-[var(--muted)] transition hover:text-[var(--text)]"
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity - 1)
                      }
                      type="button"
                    >
                      -
                    </button>
                    <input
                      aria-label="Кількість товару"
                      className="h-10 w-14 border-x border-[var(--border)] bg-transparent text-center text-sm font-black outline-none"
                      max={item.product.stock}
                      min={1}
                      onChange={(event) =>
                        handleQuantityChange(item.product.id, Number(event.target.value))
                      }
                      type="number"
                      value={item.quantity}
                    />
                    <button
                      aria-label="Збільшити кількість"
                      className="grid size-10 place-items-center text-lg font-black text-[var(--muted)] transition hover:text-[var(--text)] disabled:opacity-40"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity + 1)
                      }
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xl font-black">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      className="mt-2 text-sm font-black text-[var(--rose)] transition hover:underline"
                      onClick={() => handleRemove(item.product.id)}
                      type="button"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2 className="text-xl font-black">Підсумок</h2>
              <span className="rounded-md bg-[var(--accent-soft)] px-3 py-1 text-sm font-black text-[var(--accent-strong)]">
                {summary.totalQuantity} шт.
              </span>
            </div>

            <div className="space-y-3 py-5 text-sm font-bold text-[var(--muted)]">
              <div className="flex justify-between gap-4">
                <span>Товари</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Доставка</span>
                <span>Уточнимо пізніше</span>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-[var(--border)] pt-4">
              <span className="font-black">Разом</span>
              <span className="text-2xl font-black">{formatPrice(summary.subtotal)}</span>
            </div>

            <Link
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]"
              href="/checkout"
            >
              Оформити замовлення
            </Link>
            <button
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
              onClick={handleClearCart}
              type="button"
            >
              Очистити кошик
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}

function getEmptyCartItems(): CartItem[] {
  return [];
}
