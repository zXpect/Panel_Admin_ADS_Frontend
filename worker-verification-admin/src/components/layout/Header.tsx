import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 text-card-foreground">
      {/* Título */}
      <div>
        <h2 className="text-lg font-semibold">Panel de Administración</h2>
      </div>

      {/* Controles de usuario */}
      <div className="flex items-center gap-4">
        {/* Botón modo oscuro/claro */}
        <ThemeToggle />

        {/* Info usuario */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Admin</span>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
