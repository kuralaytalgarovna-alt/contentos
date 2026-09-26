import { create } from "zustand";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "contentos.theme";

function applyThemeToDocument(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const initialTheme: Theme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "light";
applyThemeToDocument(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyThemeToDocument(next);
    set({ theme: next });
  },
}));
