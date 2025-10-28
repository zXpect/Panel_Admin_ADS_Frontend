// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/helpers';
import * as Tooltip from '@radix-ui/react-tooltip';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Trabajadores', icon: Users, path: '/workers' },
  { title: 'Documentos', icon: FileText, path: '/documents/pending' },
  { title: 'Clientes', icon: UserCheck, path: '/clients' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-500',
        'bg-white border-r border-[hsl(var(--border))] dark:bg-[hsl(var(--background))] dark:border-[hsl(var(--border))]',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[hsl(var(--border))] dark:border-[hsl(var(--border))]">
        {sidebarOpen && (
          <h1 className="text-xl font-extrabold text-[hsl(var(--primary))] transition-all duration-500">
            WV Admin
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] dark:hover:bg-[hsl(var(--secondary))] transition-colors duration-300"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))] transition-transform duration-300" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        <Tooltip.Provider>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Tooltip.Root key={item.path}>
                <Tooltip.Trigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-xl relative transition-all duration-500 overflow-hidden',
                      'hover:translate-x-1 hover:shadow-lg hover:bg-[hsl(var(--primary))]/10 dark:hover:bg-[hsl(var(--primary))]/20',
                      isActive
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xl'
                        : 'text-[hsl(var(--muted-foreground))]'
                    )}
                  >
                    {/* Glow animado cuando está activo */}
                    {isActive && (
                      <span className="absolute inset-0 bg-[hsl(var(--primary))]/20 rounded-xl animate-pulse pointer-events-none" />
                    )}

                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors duration-300 z-10',
                        isActive ? 'text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'
                      )}
                    />
                    {sidebarOpen && (
                      <span className="text-sm font-medium z-10 transition-all duration-300">
                        {item.title}
                      </span>
                    )}

                    {/* Selector animado a la izquierda */}
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--accent))] rounded-r-xl" />
                    )}
                  </Link>
                </Tooltip.Trigger>

                {!sidebarOpen && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      align="center"
                      className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] text-xs rounded-md px-3 py-1 shadow-md select-none animate-fadeIn"
                    >
                      {item.title}
                      <Tooltip.Arrow className="fill-[hsl(var(--secondary))]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            );
          })}
        </Tooltip.Provider>
      </nav>

      {/* Footer / Branding */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm">
          Admin Panel © 2025
        </div>
      )}
    </aside>
  );
};