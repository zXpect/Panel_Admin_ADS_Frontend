import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Encabezado de cada pantalla: ficha del ícono, título, subtítulo y acciones a la derecha. */
export const PageHeader = ({ icon: Icon, title, subtitle, actions }: PageHeaderProps) => (
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-[52px] h-[52px] rounded-2xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))]
                      flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <h1 className="text-[28px] leading-9 font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
  </div>
);
