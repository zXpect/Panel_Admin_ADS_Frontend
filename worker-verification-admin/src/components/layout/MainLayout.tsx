import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/helpers';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarOpen } = useUIStore();

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
          sidebarOpen ? 'md:ml-64' : 'md:ml-16'
        )}
      >
        {/* Header */}
        <Header />

        {/* Contenido de página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background text-foreground transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};
