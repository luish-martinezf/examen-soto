import { Moon, Sun } from "@primeicons/react";
import { Button } from "@primereact/ui/button";
import { useState } from "react";
import { applyTheme, getInitialTheme, type ThemeMode } from "../../theme/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const isDark = theme === "dark";

  function toggleTheme() {
    const nextTheme: ThemeMode = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="text"
      severity="secondary"
      rounded
      iconOnly
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
