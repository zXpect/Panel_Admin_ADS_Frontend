import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EvaluatorBanner } from './EvaluatorBanner';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/helpers';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();

  return (
    <div className={cn("flex h-screen bg-background text-foreground transition-colors")}>
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor principal */}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          // Mobile: no margin (sidebar is overlay)
          // Desktop: margin based on sidebar state
          'ml-0',
          sidebarOpen ? 'md:ml-[248px]' : 'md:ml-[76px]'
        )}
      >
        {/* Header */}
        <Header />
        <EvaluatorBanner />

        {/* Contenido de página */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8 bg-background text-foreground">
          {/* La key reinicia la entrada de la pantalla al cambiar de sección (ads_open_enter) */}
          <div key={location.pathname} className="max-w-[1280px] mx-auto ads-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
