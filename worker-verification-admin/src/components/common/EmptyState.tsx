import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils/helpers';

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: ReactNode;
  className?: string;
}

/** Estado vacío como en la app: ícono de reparación grande, título y una línea de ayuda. */
export const EmptyState = ({ icon: Icon, title, description, className }: EmptyStateProps) => (
  <div className={cn('ads-rise flex flex-col items-center text-center px-6 py-12', className)}>
    <Icon className="w-16 h-16 text-[hsl(var(--muted-foreground))] mb-4" />
    <p className="font-semibold text-[hsl(var(--foreground))]">{title}</p>
    {description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] max-w-sm">{description}</p>}
  </div>
);
