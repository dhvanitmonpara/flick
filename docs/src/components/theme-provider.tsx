"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

const getPreferredTheme = (): Theme => {
  const stored = window.localStorage.getItem("flick-docs-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider() {
  useEffect(() => {
    const theme = getPreferredTheme();
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, []);

  return null;
}
