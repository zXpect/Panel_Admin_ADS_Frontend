import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b-2 border-[hsl(var(--border))] flex items-center justify-between px-6
                       text-[hsl(var(--card-foreground))] shadow-sm transition-colors duration-300">
      {/* Título */}
      <div>
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Panel de Administración</h2>
      </div>

      {/* Controles de usuario */}
      <div className="flex items-center gap-4">
        {/* Botón modo oscuro/claro */}
        <div className="hover:scale-110 transition-transform duration-300">
          <ThemeToggle />
        </div>

        {/* Info usuario mejorada */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[hsl(var(--primary))]/10
                        hover:bg-[hsl(var(--primary))]/20 transition-all duration-300 cursor-default">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                          flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Admin</span>
        </div>

        {/* Botón cerrar sesión mejorado */}
        <button
          onClick={logout}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold
                     hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]
                     rounded-xl transition-all duration-300 border-2 border-transparent
                     hover:border-[hsl(var(--destructive))]/20"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
