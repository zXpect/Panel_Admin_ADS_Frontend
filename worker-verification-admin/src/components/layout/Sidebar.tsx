// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/helpers';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect } from 'react';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: 'primary' },
  { title: 'Trabajadores', icon: Users, path: '/workers', color: 'chart-1' },
  { title: 'Documentos', icon: FileText, path: '/documents/pending', color: 'chart-5' },
  { title: 'Clientes', icon: UserCheck, path: '/clients', color: 'accent' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setMobileMenuOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 flex flex-col shadow-xl',
          'will-change-transform transition-transform duration-300 ease-out',
          'bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))]',
          'border-r-2 border-[hsl(var(--border))]',
          // Mobile: hidden by default, show as overlay when mobileMenuOpen
          'max-md:-translate-x-full max-md:w-64',
          mobileMenuOpen && 'max-md:translate-x-0',
          // Desktop: normal sidebar behavior
          'md:translate-x-0',
          sidebarOpen ? 'md:w-64' : 'md:w-16'
        )}
        style={{ transitionProperty: 'transform, width' }}
      >
      {/* Logo mejorado con gradiente y decoración */}
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-[hsl(var(--border))] relative overflow-hidden">
        {/* Efecto decorativo de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl"></div>

        {/* Mobile: always show full logo */}
        <div className="flex items-center gap-2 z-10 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                         bg-clip-text text-transparent">
            ADS Admin
          </h1>
        </div>

        {/* Desktop: show based on sidebarOpen */}
        {sidebarOpen && (
          <div className="hidden md:flex items-center gap-2 z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                            flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                           bg-clip-text text-transparent">
              ADS Admin
            </h1>
          </div>
        )}

        {!sidebarOpen && (
          <div className="hidden md:flex w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                          items-center justify-center shadow-lg mx-auto">
            <Sparkles className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="p-2 rounded-xl hover:bg-[hsl(var(--destructive))]/10 transition-all duration-300 z-10 md:hidden"
        >
          <X className="w-5 h-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]" />
        </button>

        {/* Desktop toggle button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "hidden md:block p-2 rounded-xl hover:bg-[hsl(var(--primary))]/10 transition-all duration-300 z-10",
            "border border-transparent hover:border-[hsl(var(--primary))]/20",
            "hover:shadow-md group",
            !sidebarOpen && "absolute top-1/2 -translate-y-1/2 right-2"
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]
                                    transition-all duration-300 group-hover:-translate-x-1" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]
                                     transition-all duration-300 group-hover:translate-x-1" />
          )}
        </button>
      </div>

      {/* Menu Items mejorado */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[hsl(var(--muted))]">
        <Tooltip.Provider>
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Tooltip.Root key={item.path}>
                <Tooltip.Trigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-3 rounded-xl relative transition-all duration-300 overflow-hidden',
                      'hover:scale-105 hover:shadow-lg',
                      isActive
                        ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))] shadow-xl'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {/* Efecto de brillo en hover */}
                    <span className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                      "-translate-x-full group-hover:translate-x-full",
                      "transition-transform duration-1000"
                    )} />

                    {/* Glow animado cuando está activo */}
                    {isActive && (
                      <>
                        <span className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/40 via-[hsl(var(--primary))]/20 to-transparent rounded-xl animate-pulse" />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                      </>
                    )}

                    {/* Icono con fondo decorativo */}
                    <div className={cn(
                      "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 z-10",
                      isActive
                        ? "bg-white/20 shadow-inner"
                        : "bg-[hsl(var(--muted))]/50 group-hover:bg-[hsl(var(--primary))]/10"
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-all duration-300',
                        isActive
                          ? 'text-[hsl(var(--primary-foreground))] scale-110'
                          : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:scale-110'
                      )} />
                    </div>

                    {/* Mobile: always show text, Desktop: based on sidebarOpen */}
                    <span className={cn(
                      "text-sm font-semibold z-10 transition-all duration-300",
                      isActive && "tracking-wide",
                      "md:hidden" // Always show on mobile
                    )}>
                      {item.title}
                    </span>
                    {sidebarOpen && (
                      <span className={cn(
                        "hidden md:inline text-sm font-semibold z-10 transition-all duration-300",
                        isActive && "tracking-wide"
                      )}>
                        {item.title}
                      </span>
                    )}

                    {/* Indicador de flecha cuando está activo */}
                    {isActive && (
                      <span className={cn(
                        "ml-auto text-[hsl(var(--primary-foreground))] z-10 animate-pulse",
                        "md:hidden", // Always show on mobile
                        sidebarOpen ? "md:inline" : "md:hidden"
                      )}>
                        •
                      </span>
                    )}
                    {isActive && sidebarOpen && (
                      <span className="hidden md:inline ml-auto text-[hsl(var(--primary-foreground))] z-10 animate-pulse">
                        •
                      </span>
                    )}
                  </Link>
                </Tooltip.Trigger>

                {!sidebarOpen && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      align="center"
                      sideOffset={10}
                      className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-sm font-medium
                                 rounded-xl px-4 py-2 shadow-xl border border-[hsl(var(--border))]
                                 animate-in fade-in-0 zoom-in-95 duration-200"
                    >
                      {item.title}
                      <Tooltip.Arrow className="fill-[hsl(var(--popover))]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            );
          })}
        </Tooltip.Provider>
      </nav>

      {/* Footer mejorado - Mobile: always show full, Desktop: based on sidebarOpen */}
      <div className={cn(
        "px-4 py-4 border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 relative overflow-hidden",
        "md:hidden" // Always show on mobile
      )}>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[hsl(var(--primary))]/5 to-transparent"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse"></div>
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Sistema Activo
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
            Admin Panel © 2025
          </p>
        </div>
      </div>

      {/* Desktop footer - expanded */}
      {sidebarOpen && (
        <div className="hidden md:block px-4 py-4 border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[hsl(var(--primary))]/5 to-transparent"></div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse"></div>
              <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                Sistema Activo
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Admin Panel © 2025
            </p>
            <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
              <span>Versión</span>
              <span className="px-2 py-0.5 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-md font-mono font-semibold">
                1.0.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop footer - collapsed */}
      {!sidebarOpen && (
        <div className="hidden md:flex p-2 border-t-2 border-[hsl(var(--border))] justify-center">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse"></div>
        </div>
      )}
    </aside>
    </>
  );
};