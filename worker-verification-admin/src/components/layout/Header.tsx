import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUIStore } from '@/store/uiStore';

export const Header = () => {
  const { logout } = useAuth();
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b-2 border-[hsl(var(--border))] flex items-center justify-between px-4 md:px-6
                       text-[hsl(var(--card-foreground))] shadow-sm backdrop-blur-sm animate-slide-down">
      {/* Left section - Mobile menu button and title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger menu button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-xl hover:bg-[hsl(var(--primary))]/10 transition-all duration-200 md:hidden hover:scale-110 active:scale-95"
        >
          <Menu className="w-5 h-5 text-[hsl(var(--foreground))] transition-transform duration-200" />
        </button>

        {/* Título */}
        <h2 className="text-base md:text-lg font-bold text-[hsl(var(--foreground))]">
          <span className="hidden sm:inline">Panel de Administración</span>
          <span className="sm:hidden">Admin</span>
        </h2>
      </div>

      {/* Controles de usuario */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Botón modo oscuro/claro */}
        <div className="hover:scale-110 transition-transform duration-200 active:scale-95">
          <ThemeToggle />
        </div>

        {/* Info usuario mejorada - hide text on mobile */}
        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl bg-[hsl(var(--primary))]/10
                        hover:bg-[hsl(var(--primary))]/20 transition-all duration-200 cursor-default hover:scale-105">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                          flex items-center justify-center shadow-md transition-transform duration-200 hover:rotate-6">
            <User className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <span className="hidden md:inline text-sm font-semibold text-[hsl(var(--foreground))]">Admin</span>
        </div>

        {/* Botón cerrar sesión mejorado - icon only on mobile */}
        <button
          onClick={logout}
          className="group flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-semibold
                     hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]
                     rounded-xl transition-all duration-200 border-2 border-transparent
                     hover:border-[hsl(var(--destructive))]/20 hover:scale-105 active:scale-95"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
