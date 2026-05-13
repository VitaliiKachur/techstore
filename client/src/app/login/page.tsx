"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { loginByEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginByEmail(email.trim(), password);
      router.push("/profile");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Сталася помилка при вході.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">Авторизація</p>
          <h1 className="mt-2 text-3xl font-black">Вхід у профіль</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Увійди через email та пароль, щоб отримати доступ до особистого кабінету.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold">Пароль</span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            {error ? <p className="catalog-message">{error}</p> : null}

            <button
              className="inline-flex h-11 items-center rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Вхід..." : "Увійти"}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--muted)]">
            Ще немає акаунту?{" "}
            <Link className="font-bold underline decoration-[var(--accent)] decoration-2" href="/">
              Зареєструйся через API `/api/auth/register`
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
