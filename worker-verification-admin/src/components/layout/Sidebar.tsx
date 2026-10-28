// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  CreditCard,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/helpers';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect } from 'react';
import { AdsLogo } from './AdsLogo';
import { PqrIcon } from '@/components/common/AdsIcons';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Trabajadores', icon: Users, path: '/workers' },
  { title: 'Documentos', icon: FileText, path: '/documents' },
  { title: 'Clientes', icon: UserCheck, path: '/clients' },
  { title: 'Transacciones', icon: CreditCard, path: '/transactions' },
  { title: 'PQR', icon: PqrIcon, path: '/pqr' },
  { title: 'Catálogo y tarifas', icon: Tag, path: '/catalog' },
];

/** Menú lateral navy (mockups A1-A8): se colapsa en escritorio y es un cajón en móvil. */
export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  // Cerrar el cajón móvil al cambiar de ruta o con Escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setMobileMenuOpen]);

  // En móvil siempre se ve completo; en escritorio depende de sidebarOpen
  const expanded = sidebarOpen || mobileMenuOpen;

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 flex flex-col gap-1.5 px-4 py-5',
          'bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]',
          'transition-[transform,width] duration-300 ease-out',
          'max-md:-translate-x-full max-md:w-[248px]',
          mobileMenuOpen && 'max-md:translate-x-0',
          'md:translate-x-0',
          sidebarOpen ? 'md:w-[248px]' : 'md:w-[76px] md:px-3'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 pb-5', expanded ? 'px-1.5' : 'justify-center')}>
          <AdsLogo size={40} variant="onNavy" />
          {expanded && (
            <div className="flex flex-col min-w-0">
              <span className="text-xl leading-[22px] font-extrabold text-[hsl(var(--on-navy))]">ADS</span>
              <span className="text-xs leading-4">Administración</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
            className="ml-auto p-2 rounded-xl hover:bg-white/10 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Secciones" className="flex flex-col gap-1 flex-1 overflow-y-auto">
          <Tooltip.Provider delayDuration={200}>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Tooltip.Root key={item.path}>
                  <Tooltip.Trigger asChild>
                    <Link
                      to={item.path === '/documents' ? '/documents/pending' : item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'min-h-[44px] rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors',
                        expanded ? 'px-3.5' : 'justify-center',
                        isActive
                          ? 'bg-[hsl(var(--brand-on-navy))] text-[hsl(var(--navy))]'
                          : 'hover:bg-white/10 hover:text-[hsl(var(--on-navy))]'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.9} />
                      {expanded && <span className="truncate">{item.title}</span>}
                    </Link>
                  </Tooltip.Trigger>
                  {!expanded && (
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={10}
                        className="z-[60] rounded-lg px-3 py-1.5 text-sm font-semibold bg-[hsl(var(--sidebar))] text-[hsl(var(--on-navy))] shadow-lg"
                      >
                        {item.title}
                        <Tooltip.Arrow className="fill-[hsl(var(--sidebar))]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              );
            })}
          </Tooltip.Provider>
        </nav>

        {/* Pie */}
        <div className={cn('pt-3 border-t border-[hsl(var(--sidebar-border))] text-xs leading-[18px]',
          expanded ? 'px-1.5' : 'flex justify-center')}>
          {expanded ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--brand-on-navy))]" />
                Sistema activo
              </div>
              <div>Versión 1.0.0</div>
            </>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--brand-on-navy))]" aria-label="Sistema activo" />
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
            className="hidden md:flex mt-3 w-9 h-9 items-center justify-center rounded-xl hover:bg-white/10"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
