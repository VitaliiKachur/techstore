"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    return savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
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
      <span className="theme-toggle__label">{theme === "dark" ? "Темна" : "Світла"}</span>
    </button>
  );
}
