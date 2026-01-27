import { useLocalStorage } from "./useLocalStorage";
import { useEffect } from "react";

export const THEMES = [
  { id: "zinc", name: "Midnight", color: "bg-zinc-950" },
  { id: "ocean", name: "Ocean", color: "bg-blue-950" },
  { id: "sunset", name: "Sunset", color: "bg-orange-950" },
  { id: "hacker", name: "Hacker", color: "bg-green-950" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeId>("app_theme", "zinc");

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove old theme attributes if any (though we are just setting one)
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    themes: THEMES,
  };
}
