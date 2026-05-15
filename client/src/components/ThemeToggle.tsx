"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const THEME_UPDATED_EVENT = "techstore-theme-updated";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeUpdates,
    getClientTheme,
    getServerTheme
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  }

  return (
    <button
      aria-label="Перемкнути тему"
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-toggle__label">
        {theme === "dark" ? "Темна" : "Світла"}
      </span>
    </button>
  );
}

function subscribeToThemeUpdates(callback: () => void): () => void {
  window.addEventListener(THEME_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getClientTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";

  document.documentElement.dataset.theme = theme;
  return theme;
}

function getServerTheme(): Theme {
  return "light";
}
