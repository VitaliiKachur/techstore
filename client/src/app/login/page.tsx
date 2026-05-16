"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { loginByEmail, loginWithGoogle, registerByEmail } from "@/lib/auth";

type AuthMode = "login" | "register";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;

    renderButton: (
      parent: HTMLElement,
      options: {
        theme: "outline";
        size: "large";
        text: "continue_with" | "signup_with";
        locale?: string;
      },
    ) => void;

    prompt: () => void;
  };
};

type GoogleWindow = Window & {
  google?: {
    accounts: GoogleAccounts;
  };
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("register") === "1" ||
    searchParams.get("mode") === "register"
      ? "register"
      : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleButtonText = useMemo(
    () => (mode === "register" ? "signup_with" : "continue_with"),
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await registerByEmail(name.trim(), email.trim(), password);
      } else {
        await loginByEmail(email.trim(), password);
      }
      router.push("/profile");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Сталася помилка при авторизації.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const scriptId = "google-identity-services";

    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");

    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const google = (window as GoogleWindow).google;

      if (!google) {
        return;
      }

      google.accounts.id.initialize({
        client_id: googleClientId,

        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setError("Google не повернув токен. Спробуй ще раз.");
            return;
          }

          setError("");
          setIsSubmitting(true);

          try {
            await loginWithGoogle(response.credential);
            router.push("/profile");
          } catch (requestError) {
            const message =
              requestError instanceof Error
                ? requestError.message
                : "Сталася помилка при Google-вході.";

            setError(message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      const container = document.getElementById("google-signin-button");

      if (container) {
        google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          text: googleButtonText,
          locale: "uk",
        });
      }
    };

    document.head.appendChild(script);
  }, [googleButtonText, googleClientId, router]);

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
            Авторизація
          </p>
          <h1 className="mt-2 text-3xl font-black">
            {mode === "register" ? "Реєстрація акаунта" : "Вхід у профіль"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {mode === "register"
              ? "Створи акаунт через email або продовж з Google."
              : "Увійди через email та пароль або продовж з Google."}
          </p>
          <div
            className="mt-5 flex gap-1 rounded-md bg-[var(--page)] p-1"
            role="tablist"
            aria-label="Режим авторизації"
          >
            <button
              aria-selected={mode === "login"}
              className={`h-10 flex-1 rounded-md px-3 text-sm font-bold transition sm:px-4 ${
                mode === "login"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] hover:text-[var(--text)]"
              }`}
              onClick={() => setMode("login")}
              role="tab"
              type="button"
            >
              Вхід
            </button>
            <button
              aria-selected={mode === "register"}
              className={`h-10 flex-1 rounded-md px-3 text-sm font-bold transition sm:px-4 ${
                mode === "register"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] hover:text-[var(--text)]"
              }`}
              onClick={() => setMode("register")}
              role="tab"
              type="button"
            >
              Реєстрація
            </button>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="block">
                <span className="text-sm font-bold">Ім&apos;я</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-[var(--accent)]"
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  type="text"
                  value={name}
                />
              </label>
            ) : null}

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
                minLength={6}
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
              {isSubmitting
                ? "Обробка..."
                : mode === "register"
                  ? "Зареєструватися"
                  : "Увійти"}
            </button>
          </form>
        
          <div className="mt-4">
            {googleClientId ? (
              <div id="google-signin-button" />
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Щоб увімкнути Google-вхід, додай `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
                у `.env.local`.
              </p>
            )}
          </div>
       
          <p className="mt-5 text-sm text-[var(--muted)]">
            Після авторизації ти потрапляєш у{" "}
            <Link
              className="font-bold underline decoration-[var(--accent)] decoration-2"
              href="/profile"
            >
              профіль
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
          <SiteHeader />
          <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <p className="catalog-message mx-auto max-w-xl">
              Завантаження форми входу...
            </p>
          </section>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
