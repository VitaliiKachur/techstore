"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  AuthUser,
  clearAuthToken,
  getAuthToken,
  loadCurrentUser,
  updateCurrentUser,
} from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();

      if (!token) {
        setError("Сесію не знайдено. Увійди в акаунт.");
        setIsLoading(false);
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
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити дані профілю.";
        setError(message);
      } finally {
        setIsLoading(false);
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
      setSuccess("Профіль оновлено. Ці дані підставлятимемо в оформлення замовлення.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося зберегти профіль. Спробуй ще раз.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Обери файл зображення для аватара.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">Особистий кабінет</p>
          <h1 className="mt-2 text-3xl font-black">Профіль користувача</h1>

          {isLoading ? <p className="mt-5 catalog-message">Завантаження профілю...</p> : null}

          {!isLoading && error ? (
            <div className="mt-5 space-y-3">
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
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4">
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
                <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--accent)]">
                  Обрати фото
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    type="file"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold">Ім&apos;я</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
              </label>

              <p>
                <span className="font-bold">Email:</span> {user.email}
              </p>

              <label className="block">
                <span className="text-sm font-bold">Телефон для швидкого замовлення</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                  onChange={(event) => setDeliveryPhone(event.target.value)}
                  placeholder="+380..."
                  type="text"
                  value={deliveryPhone}
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">Адреса доставки</span>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-2 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Місто, відділення або адреса"
                  value={deliveryAddress}
                />
              </label>

              {success ? <p className="catalog-message">{success}</p> : null}

              <button
                className="inline-flex h-10 items-center rounded-md bg-[var(--text)] px-4 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
                disabled={isSaving}
                onClick={handleSaveProfile}
                type="button"
              >
                {isSaving ? "Зберігаємо..." : "Зберегти профіль"}
              </button>

              <button
                className="ml-3 inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-bold transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
                onClick={handleLogout}
                type="button"
              >
                Вийти
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
