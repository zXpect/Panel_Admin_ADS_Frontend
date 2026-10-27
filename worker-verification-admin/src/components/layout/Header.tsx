import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUIStore } from '@/store/uiStore';
import { AdsLogo } from './AdsLogo';
import { usePanelRole } from '@/hooks/usePanelRole';

/** Barra superior (mockups A1-A8): título, modo oscuro, cuenta que inició sesión y cerrar sesión. */
export const Header = () => {
  const { logout } = useAuth();
  const { toggleMobileMenu } = useUIStore();
  const { displayName, initials, isEvaluator } = usePanelRole();

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
        {/* En móvil el menú lateral está oculto: el logo va aquí */}
        <span className="md:hidden flex items-center gap-1.5">
          <AdsLogo size={32} />
          <span className="text-base font-extrabold text-[hsl(var(--foreground))]">ADS</span>
        </span>
        <span className="hidden md:inline text-sm font-semibold text-[hsl(var(--muted-foreground))]">Panel de administración</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--foreground))] min-w-0"
          title={isEvaluator ? `${displayName} · evaluador` : displayName}>
          <div aria-hidden="true"
            className="w-9 h-9 flex-shrink-0 rounded-full bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-xs font-extrabold">
            {initials}
          </div>
          <span className="hidden md:inline max-w-[180px] truncate">{displayName}</span>
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
