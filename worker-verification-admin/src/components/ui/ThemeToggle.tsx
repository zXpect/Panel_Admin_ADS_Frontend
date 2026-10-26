import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    // Optimizacion: usar requestAnimationFrame para evitar lag
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    });
  }, [theme]);

  const toggleTheme = () => {
    // Transicion suave sin lag
    document.documentElement.style.transition = 'none';
    setTheme(theme === "light" ? "dark" : "light");
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 0);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      className="w-11 h-11 rounded-full border-[1.5px] border-[hsl(var(--border))] flex items-center justify-center
                 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
