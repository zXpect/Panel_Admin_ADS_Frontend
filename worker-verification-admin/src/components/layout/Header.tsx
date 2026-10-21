import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUIStore } from '@/store/uiStore';

/** Barra superior (mockups A1-A8): título, modo oscuro, administrador y cerrar sesión. */
export const Header = () => {
  const { logout } = useAuth();
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="min-h-[68px] flex items-center justify-between gap-3 px-4 md:px-10 py-3
                       bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMobileMenu}
          aria-label="Abrir menú"
          className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center hover:bg-[hsl(var(--muted))] md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Panel de administración</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--foreground))]">
          <div className="w-9 h-9 rounded-full bg-[#1B1830] text-[#F28A2E] flex items-center justify-center text-xs font-extrabold">
            AD
          </div>
          <span className="hidden md:inline">Admin</span>
        </div>
        <button
          onClick={logout}
          className="min-h-[44px] flex items-center gap-2 px-2 text-sm font-semibold text-[hsl(var(--foreground))]
                     rounded-xl hover:bg-[hsl(var(--muted))]"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
