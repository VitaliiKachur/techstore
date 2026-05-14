"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/ProductImage";
import SiteHeader from "@/components/SiteHeader";
import {
  AuthUser,
  clearAuthToken,
  getAuthToken,
  loadCurrentUser,
  updateCurrentUser,
} from "@/lib/auth";
import {
  CustomerOrder,
  getOrderStatusLabel,
  isCompletedOrder,
  loadCustomerOrders,
} from "@/lib/orders";

type OrdersTab = "active" | "completed";

const AVATAR_MAX_DIMENSION = 256;
const AVATAR_QUALITY = 0.82;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersTab, setOrdersTab] = useState<OrdersTab>("active");
  const [name, setName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeOrders = useMemo(
    () => orders.filter((order) => !isCompletedOrder(order.status)),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((order) => isCompletedOrder(order.status)),
    [orders]
  );
  const visibleOrders = ordersTab === "active" ? activeOrders : completedOrders;

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();

      if (!token) {
        setError("Сесію не знайдено. Увійди в акаунт.");
        setIsLoading(false);
        setIsOrdersLoading(false);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();
        setUser(currentUser);
        setName(currentUser.name);
        setDeliveryPhone(currentUser.deliveryPhone ?? "");
        setDeliveryAddress(currentUser.deliveryAddress ?? "");
        setAvatarUrl(currentUser.avatarUrl);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити дані профілю."
        );
      } finally {
        setIsLoading(false);
      }

      try {
        setOrders(await loadCustomerOrders());
      } catch (requestError) {
        setOrdersError(
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити замовлення."
        );
      } finally {
        setIsOrdersLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    clearAuthToken();
    router.push("/login");
  }

  async function handleSaveProfile() {
    if (!user) {
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        name: name.trim(),
        deliveryAddress: deliveryAddress.trim() || null,
        deliveryPhone: deliveryPhone.trim() || null,
        avatarUrl,
      });
      setUser(updatedUser);
      setName(updatedUser.name);
      setDeliveryPhone(updatedUser.deliveryPhone ?? "");
      setDeliveryAddress(updatedUser.deliveryAddress ?? "");
      setAvatarUrl(updatedUser.avatarUrl);
      setSuccess("Дані профілю та адреса за замовчуванням оновлені.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося зберегти профіль. Спробуй ще раз."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Обери файл зображення для аватара.");
      return;
    }

    try {
      setError("");
      setAvatarUrl(await resizeAvatar(file));
    } catch {
      setError("Не вдалося обробити фото. Спробуй інше зображення.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
              Особистий кабінет
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              Профіль і замовлення
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Керуй контактами, адресою за замовчуванням і відстежуй статус
              своїх замовлень.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
            onClick={handleLogout}
            type="button"
          >
            Вийти
          </button>
        </div>

        {isLoading ? <p className="catalog-message">Завантаження профілю...</p> : null}

        {!isLoading && error ? (
          <div className="space-y-3">
            <p className="catalog-message">{error}</p>
            <Link
              className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--accent)]"
              href="/login"
            >
              Перейти до входу
            </Link>
          </div>
        ) : null}

        {!isLoading && user ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
                {avatarUrl ? (
                  // Data URL avatars are user-provided, so we intentionally render a native img tag.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Фото профілю"
                    className="size-20 rounded-full border border-[var(--border)] object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-full bg-[var(--accent-soft)] text-2xl font-black text-[var(--accent-strong)]">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 truncate text-sm font-bold text-[var(--muted)]">
                    {user.email}
                  </p>
                </div>
              </div>

              <label className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--accent)]">
                Обрати фото
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  type="file"
                />
              </label>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <ProfileMetric label="Активні" value={activeOrders.length} />
                <ProfileMetric label="Завершені" value={completedOrders.length} />
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                      Дані профілю
                    </p>
                    <h2 className="text-2xl font-black">
                      Адреса за замовчуванням
                    </h2>
                  </div>
                  <span className="rounded-md bg-[var(--accent-soft)] px-3 py-1 text-sm font-black text-[var(--accent-strong)]">
                    Підставляється в checkout
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold">Ім&apos;я</span>
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                      minLength={2}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      value={name}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold">Телефон для доставки</span>
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                      onChange={(event) => setDeliveryPhone(event.target.value)}
                      placeholder="+380..."
                      type="tel"
                      value={deliveryPhone}
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-sm font-bold">
                      Адреса за замовчуванням
                    </span>
                    <textarea
                      className="mt-1 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-2 outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
                      onChange={(event) => setDeliveryAddress(event.target.value)}
                      placeholder="Місто, відділення Нової пошти або адреса кур'єра"
                      value={deliveryAddress}
                    />
                  </label>
                </div>

                {success ? <p className="catalog-message mt-4">{success}</p> : null}

                <button
                  className="mt-5 inline-flex h-11 items-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                  type="button"
                >
                  {isSaving ? "Зберігаємо..." : "Зберегти зміни"}
                </button>
              </section>

              <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                      Мої замовлення
                    </p>
                    <h2 className="text-2xl font-black">
                      Статуси та історія
                    </h2>
                  </div>
                  <div className="inline-flex rounded-md bg-[var(--page)] p-1">
                    <OrdersTabButton
                      active={ordersTab === "active"}
                      count={activeOrders.length}
                      label="Активні"
                      onClick={() => setOrdersTab("active")}
                    />
                    <OrdersTabButton
                      active={ordersTab === "completed"}
                      count={completedOrders.length}
                      label="Завершені"
                      onClick={() => setOrdersTab("completed")}
                    />
                  </div>
                </div>

                {isOrdersLoading ? (
                  <p className="catalog-message">Завантаження замовлень...</p>
                ) : null}

                {!isOrdersLoading && ordersError ? (
                  <p className="catalog-message">{ordersError}</p>
                ) : null}

                {!isOrdersLoading && !ordersError && visibleOrders.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-6">
                    <h3 className="text-xl font-black">
                      {ordersTab === "active"
                        ? "Активних замовлень немає"
                        : "Завершених замовлень немає"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Коли замовлення з&apos;являться, тут буде видно їхній
                      склад, суму та поточний статус.
                    </p>
                    <Link
                      className="mt-4 inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--accent)]"
                      href="/products"
                    >
                      Перейти до товарів
                    </Link>
                  </div>
                ) : null}

                {!isOrdersLoading && visibleOrders.length > 0 ? (
                  <div className="space-y-4">
                    {visibleOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ProfileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
    </div>
  );
}

function OrdersTabButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-10 rounded-md px-3 text-sm font-black transition ${
        active
          ? "bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]"
          : "text-[var(--muted)] hover:text-[var(--text)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label} ({count})
    </button>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
            Замовлення #{order.id.slice(-6).toUpperCase()}
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--muted)]">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className="inline-flex rounded-md bg-[var(--accent-soft)] px-3 py-1 text-sm font-black text-[var(--accent-strong)]">
            {getOrderStatusLabel(order.status)}
          </span>
          <p className="mt-2 text-xl font-black">{formatPrice(order.totalPrice)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item) => (
          <div
            className="grid grid-cols-[72px_1fr_auto] items-center gap-3"
            key={item.id}
          >
            <ProductImage
              alt={item.product.title}
              className="min-h-[72px] rounded-md"
              src={item.product.image}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{item.product.title}</p>
              <p className="mt-1 text-xs font-bold text-[var(--muted)]">
                {item.product.category.name}
              </p>
            </div>
            <p className="text-sm font-black">x{item.quantity}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Image file did not load as a data URL"));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error("Failed to load image"));
      image.onload = () => {
        const scale = Math.min(
          1,
          AVATAR_MAX_DIMENSION / image.width,
          AVATAR_MAX_DIMENSION / image.height
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas is not available"));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", AVATAR_QUALITY));
      };
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
