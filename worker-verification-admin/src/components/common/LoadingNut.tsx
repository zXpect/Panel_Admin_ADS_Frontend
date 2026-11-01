import { cn } from '@/lib/utils/helpers';
import { NutIcon } from './AdsIcons';

interface LoadingNutProps {
  /** sm: dentro de un botón; md: dentro de una tarjeta; lg: pantalla completa */
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZES = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

/** Indicador de carga de ADS: la tuerca naranja de la app que gira (Widget.ADS.ProgressBar). */
export const LoadingNut = ({ size = 'lg', label = 'Cargando…', className }: LoadingNutProps) => (
  <span role="status" className={cn('inline-flex', className)}>
    <NutIcon className={cn('ads-nut-spin', SIZES[size], size !== 'sm' && 'text-[hsl(var(--primary))]')} />
    <span className="sr-only">{label}</span>
  </span>
);
