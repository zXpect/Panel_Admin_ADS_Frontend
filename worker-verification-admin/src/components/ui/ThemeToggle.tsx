import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
      )}
    </Button>
  );
}
