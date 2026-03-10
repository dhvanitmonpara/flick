"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

type Theme = "light" | "dark";

function ThemedToaster() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const themeData = document.getElementById("theme-data") as HTMLElement;
      setTheme((themeData.dataset.theme as Theme) || "light");
    })()
  }, []);

  return <Toaster richColors theme={theme} containerAriaLabel="toaster" />;
}

export default ThemedToaster;
