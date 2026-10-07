export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "editorial-theme";

export function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function initializeTheme() {
  applyTheme(getInitialTheme());
}
