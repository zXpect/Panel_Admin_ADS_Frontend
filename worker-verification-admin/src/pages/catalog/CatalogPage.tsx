import { Tag } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCatalogAdmin } from '@/hooks/useCatalogAdmin';
import { ConfigPanel } from '@/components/features/catalog/ConfigPanel';
import { CategoryCard } from '@/components/features/catalog/CategoryCard';
import { AuditPanel } from '@/components/features/catalog/AuditPanel';
import { usePanelRole } from '@/hooks/usePanelRole';
import { LoadingNut } from '@/components/common/LoadingNut';

/** Catálogo y tarifas (HU-29, A4): oficios, tareas, rangos, parámetros e historial. */
export const CatalogPage = () => {
  const {
    categories, configs, isLoading, updateCategory, updateTask, createTask, updateConfig, isSaving,
  } = useCatalogAdmin();
  const { isEvaluator } = usePanelRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingNut />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Tag} title="Catálogo y tarifas"
        subtitle={isEvaluator
          ? `${categories.length} oficios · solo lectura en modo evaluación`
          : `${categories.length} oficios · los cambios quedan en el historial`} />

      {/* En modo evaluación se ven las tarifas, pero sus controles quedan deshabilitados */}
      <fieldset disabled={isEvaluator} className="contents">
      <ConfigPanel
        configs={configs}
        onSave={(key, value) => updateConfig({ key, value })}
        isSaving={isSaving}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Oficios y tareas</h2>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onUpdateCategory={(id, input) => updateCategory({ id, input })}
            onUpdateTask={(id, input) => updateTask({ id, input })}
            onCreateTask={createTask}
            isSaving={isSaving}
          />
        ))}
      </div>
      </fieldset>

      <AuditPanel />
    </div>
  );
};
