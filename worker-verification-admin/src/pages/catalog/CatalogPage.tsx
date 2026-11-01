import { useSearchParams } from 'react-router-dom';
import { History, Layers, SlidersHorizontal, Tag } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCatalogAdmin } from '@/hooks/useCatalogAdmin';
import { ConfigPanel } from '@/components/features/catalog/ConfigPanel';
import { CategoryBrowser } from '@/components/features/catalog/CategoryBrowser';
import { AuditPanel } from '@/components/features/catalog/AuditPanel';
import { usePanelRole } from '@/hooks/usePanelRole';
import { LoadingNut } from '@/components/common/LoadingNut';
import { cn } from '@/lib/utils/helpers';

type CatalogTab = 'oficios' | 'parametros' | 'historial';

const TABS: { value: CatalogTab; label: string; icon: typeof Tag }[] = [
  { value: 'oficios', label: 'Oficios y tareas', icon: Layers },
  { value: 'parametros', label: 'Parámetros', icon: SlidersHorizontal },
  { value: 'historial', label: 'Historial', icon: History },
];

/** Catálogo y tarifas (HU-29, A4): oficios, tareas, rangos, parámetros e historial, en pestañas. */
export const CatalogPage = () => {
  const {
    categories, configs, isLoading, updateCategory, updateTask, createTask, updateConfig, isSaving,
  } = useCatalogAdmin();
  const { isEvaluator } = usePanelRole();

  // La pestaña y el oficio van en la URL: recargar o volver atrás conserva la vista
  const [params, setParams] = useSearchParams();
  const tab: CatalogTab = TABS.some((item) => item.value === params.get('tab'))
    ? params.get('tab') as CatalogTab
    : 'oficios';
  const selectTab = (value: CatalogTab) => setParams(value === 'oficios' ? {} : { tab: value });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingNut />
      </div>
    );
  }

  const taskCount = categories.reduce((sum, category) => sum + category.tasks.length, 0);
  const activeTasks = categories.reduce(
    (sum, category) => sum + category.tasks.filter((task) => task.is_active).length, 0);

  return (
    <div className="space-y-6">
      <PageHeader icon={Tag} title="Catálogo y tarifas"
        subtitle={`${categories.length} oficios · ${activeTasks} de ${taskCount} tareas activas · ${isEvaluator
          ? 'solo lectura en modo evaluación'
          : 'los cambios quedan en el historial'}`} />

      <div role="tablist" aria-label="Secciones del catálogo" className="flex flex-wrap gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => selectTab(value)}
            className={cn(
              'min-h-[40px] px-4 rounded-full text-sm font-semibold border-[1.5px] transition-colors inline-flex items-center gap-2',
              tab === value
                ? 'bg-[hsl(var(--navy))] text-[hsl(var(--on-navy))] border-transparent dark:bg-[hsl(var(--primary))] dark:text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'oficios' && (
        <CategoryBrowser
          categories={categories}
          selectedSlug={params.get('oficio')}
          onSelect={(slug) => setParams({ oficio: slug }, { replace: true })}
          readOnly={isEvaluator}
          onUpdateCategory={(id, input) => updateCategory({ id, input })}
          onUpdateTask={(id, input) => updateTask({ id, input })}
          onCreateTask={createTask}
          isSaving={isSaving}
        />
      )}

      {tab === 'parametros' && (
        // En modo evaluación se ven los valores, pero sus controles quedan deshabilitados
        <fieldset disabled={isEvaluator} className="min-w-0">
          <ConfigPanel
            configs={configs}
            onSave={(key, value) => updateConfig({ key, value })}
            isSaving={isSaving}
          />
        </fieldset>
      )}

      {tab === 'historial' && <AuditPanel />}
    </div>
  );
};
