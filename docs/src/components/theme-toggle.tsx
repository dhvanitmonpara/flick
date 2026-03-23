"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
};

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);
    const initialTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("flick-docs-theme", nextTheme);
  };

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className="inline-flex h-[38px] w-[88px] items-center justify-center rounded-full border border-border-strong bg-surface shadow-sm" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-3 rounded-full border border-border-strong bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
    >
      <span className="relative flex h-6 w-11 items-center rounded-full bg-[color-mix(in_srgb,var(--primary)_24%,var(--surface-strong))] p-1 transition">
        <span
          className={`h-4 w-4 rounded-full bg-primary shadow-sm transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
