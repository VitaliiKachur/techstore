"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import ProductImage from "@/components/ProductImage";
import {
  CartItem,
  getCartItems,
  getCartSummary,
  subscribeToCartUpdates,
} from "@/lib/cart";

type DeliveryMethod = "nova-poshta" | "courier" | "pickup";
type PaymentMethod = "card" | "cash" | "invoice";

const EMPTY_CART_ITEMS: CartItem[] = [];

const novaPoshtaBranches: Record<string, string[]> = {
  Київ: [
    "Відділення №1, вул. Пирогівський шлях, 135",
    "Відділення №5, вул. Антоновича, 50",
    "Відділення №18, просп. Берестейський, 65",
    "Поштомат №2211, ТРЦ Gulliver",
  ],
  Львів: [
    "Відділення №1, вул. Городоцька, 355",
    "Відділення №6, вул. Січових Стрільців, 10",
    "Відділення №14, просп. Червоної Калини, 62",
  ],
  Одеса: [
    "Відділення №2, вул. Базова, 16",
    "Відділення №8, вул. Академіка Корольова, 46",
    "Відділення №24, просп. Небесної Сотні, 2",
  ],
  Харків: [
    "Відділення №1, вул. Польова, 67",
    "Відділення №7, просп. Науки, 41/43",
    "Відділення №22, вул. Гвардійців-Широнінців, 33",
  ],
  Дніпро: [
    "Відділення №1, вул. Маршала Малиновського, 98",
    "Відділення №10, просп. Дмитра Яворницького, 55",
    "Відділення №31, вул. Робоча, 152",
  ],
};

const cityOptions = Object.keys(novaPoshtaBranches);

export default function CheckoutPageClient() {
  const items = useSyncExternalStore(
    subscribeToCartUpdates,
    getCartItems,
    getEmptyCartItems
  );
  const summary = useMemo(() => getCartSummary(items), [items]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nova-poshta");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [city, setCity] = useState(cityOptions[0]);
  const [branch, setBranch] = useState(novaPoshtaBranches[cityOptions[0]][0]);
  const [message, setMessage] = useState("");

  const deliveryPrice = deliveryMethod === "pickup" ? 0 : 90;
  const total = summary.subtotal + deliveryPrice;
  const branches = novaPoshtaBranches[city] ?? [];

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    setBranch(novaPoshtaBranches[nextCity]?.[0] ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setMessage("Кошик порожній. Додай товари перед оформленням.");
      return;
    }

    setMessage(
      "Дані замовлення зібрано. Наступним кроком підключимо створення замовлення на backend."
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Оформлення
          </p>
          <h1 className="mt-2 text-3xl font-black">Кошик порожній</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Щоб оформити замовлення, спочатку додай товари в кошик.
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]"
            href="/products"
          >
            Перейти до каталогу
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
          Оформлення
        </p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">
          Дані для замовлення
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Заповни контактні дані, обери доставку й спосіб оплати. Після цього
          підключимо реальне створення замовлення.
        </p>
      </div>

      <form className="grid gap-6 lg:grid-cols-[1fr_380px]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                  Крок 1
                </p>
                <h2 className="text-xl font-black">Покупець</h2>
              </div>
              <span className="text-sm font-bold text-[var(--muted)]">
                Контакт для підтвердження
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold">Ім&apos;я та прізвище</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                  name="fullName"
                  placeholder="Віталій Качур"
                  required
                  type="text"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Телефон</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                  name="phone"
                  placeholder="+380..."
                  required
                  type="tel"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Email</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Додатковий телефон</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                  name="backupPhone"
                  placeholder="Необов'язково"
                  type="tel"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-5 border-b border-[var(--border)] pb-4">
              <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                Крок 2
              </p>
              <h2 className="text-xl font-black">Доставка</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DeliveryOption
                checked={deliveryMethod === "nova-poshta"}
                description="Відділення або поштомат"
                label="Нова пошта"
                onChange={() => setDeliveryMethod("nova-poshta")}
              />
              <DeliveryOption
                checked={deliveryMethod === "courier"}
                description="Кур'єром за адресою"
                label="Кур'єр"
                onChange={() => setDeliveryMethod("courier")}
              />
              <DeliveryOption
                checked={deliveryMethod === "pickup"}
                description="З магазину TechStore"
                label="Самовивіз"
                onChange={() => setDeliveryMethod("pickup")}
              />
            </div>

            {deliveryMethod === "nova-poshta" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Місто</span>
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    onChange={(event) => handleCityChange(event.target.value)}
                    value={city}
                  >
                    {cityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Відділення Нової пошти</span>
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    onChange={(event) => setBranch(event.target.value)}
                    value={branch}
                  >
                    {branches.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-bold">
                    Інше відділення або уточнення
                  </span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    name="customBranch"
                    placeholder="Наприклад: Відділення №12 або поштомат біля дому"
                    type="text"
                  />
                </label>
              </div>
            ) : null}

            {deliveryMethod === "courier" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Місто</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    name="courierCity"
                    placeholder="Київ"
                    required
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Вулиця і будинок</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    name="courierAddress"
                    placeholder="вул. Хрещатик, 1"
                    required
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Квартира / офіс</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    name="apartment"
                    placeholder="12"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Бажаний час доставки</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                    name="deliveryTime"
                    placeholder="Після 18:00"
                    type="text"
                  />
                </label>
              </div>
            ) : null}

            {deliveryMethod === "pickup" ? (
              <p className="mt-5 rounded-md border border-[var(--border)] bg-[var(--page)] p-4 text-sm font-bold text-[var(--muted)]">
                Самовивіз доступний з шоуруму TechStore після підтвердження
                менеджером. Адресу й час резерву покажемо після підключення
                backend-замовлень.
              </p>
            ) : null}
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-5 border-b border-[var(--border)] pb-4">
              <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                Крок 3
              </p>
              <h2 className="text-xl font-black">Оплата</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <PaymentOption
                checked={paymentMethod === "card"}
                description="Онлайн після підтвердження"
                label="Карткою"
                onChange={() => setPaymentMethod("card")}
              />
              <PaymentOption
                checked={paymentMethod === "cash"}
                description="При отриманні"
                label="Готівкою"
                onChange={() => setPaymentMethod("cash")}
              />
              <PaymentOption
                checked={paymentMethod === "invoice"}
                description="Для ФОП або компанії"
                label="Рахунок"
                onChange={() => setPaymentMethod("invoice")}
              />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-bold">Коментар до замовлення</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-2 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                name="comment"
                placeholder="Наприклад: зателефонувати перед відправкою"
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-xl font-black">Замовлення</h2>
            <Link
              className="text-sm font-black text-[var(--accent-strong)] hover:underline"
              href="/cart"
            >
              Редагувати
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div className="grid grid-cols-[72px_1fr] gap-3" key={item.product.id}>
                <ProductImage
                  alt={item.product.title}
                  className="min-h-[72px] rounded-md"
                  src={item.product.image}
                />
                <div>
                  <p className="line-clamp-2 text-sm font-black">{item.product.title}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--muted)]">
                    {item.quantity} x {formatPrice(item.product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5 text-sm font-bold text-[var(--muted)]">
            <div className="flex justify-between gap-4">
              <span>Товари</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Доставка</span>
              <span>{deliveryPrice === 0 ? "Безкоштовно" : formatPrice(deliveryPrice)}</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-[var(--border)] pt-5">
            <span className="font-black">До сплати</span>
            <span className="text-2xl font-black">{formatPrice(total)}</span>
          </div>

          <button
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]"
            type="submit"
          >
            Підтвердити дані
          </button>

          {message ? (
            <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--page)] p-3 text-sm font-bold text-[var(--muted)]">
              {message}
            </p>
          ) : null}
        </aside>
      </form>
    </section>
  );
}

function DeliveryOption({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border p-4 transition ${
        checked
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--page)] hover:border-[var(--accent)]"
      }`}
    >
      <input
        checked={checked}
        className="sr-only"
        name="deliveryMethod"
        onChange={onChange}
        type="radio"
      />
      <span className="block font-black">{label}</span>
      <span className="mt-1 block text-sm font-bold text-[var(--muted)]">
        {description}
      </span>
    </label>
  );
}

function PaymentOption({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border p-4 transition ${
        checked
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--page)] hover:border-[var(--accent)]"
      }`}
    >
      <input
        checked={checked}
        className="sr-only"
        name="paymentMethod"
        onChange={onChange}
        type="radio"
      />
      <span className="block font-black">{label}</span>
      <span className="mt-1 block text-sm font-bold text-[var(--muted)]">
        {description}
      </span>
    </label>
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
  return EMPTY_CART_ITEMS;
}
