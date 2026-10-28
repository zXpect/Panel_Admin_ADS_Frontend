import { TradeIcon } from '@/components/common/AdsIcons';
import { WORKER_CATEGORIES, workerCategorySlugs } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/helpers';

interface TradeChipsProps {
  worker: { categories?: string[]; work?: string | null };
  empty?: string;
  className?: string;
}

/** Oficios del trabajador como chips con el ícono de cada oficio (como en la app). */
export const TradeChips = ({ worker, empty = 'Sin oficio', className }: TradeChipsProps) => {
  const slugs = workerCategorySlugs(worker);
  if (!slugs.length) return <span className="text-[hsl(var(--muted-foreground))]">{empty}</span>;
  return (
    <span className={cn('flex flex-wrap gap-1', className)}>
      {slugs.map((slug) => (
        <span key={slug} className="chip chip-brand">
          <TradeIcon slug={slug} className="w-3.5 h-3.5" />
          {WORKER_CATEGORIES.find((category) => category.slug === slug)?.name || slug}
        </span>
      ))}
    </span>
  );
};
