import { Tags } from 'lucide-react';
import { useCatalogAdmin } from '@/hooks/useCatalogAdmin';
import { ConfigPanel } from '@/components/features/catalog/ConfigPanel';
import { CategoryCard } from '@/components/features/catalog/CategoryCard';
import { AuditPanel } from '@/components/features/catalog/AuditPanel';

/** Catálogo y tarifas (HU-29, A4): oficios, tareas, rangos, parámetros e historial. */
export const CatalogPage = () => {
  const {
    categories, configs, isLoading, updateCategory, updateTask, createTask, updateConfig, isSaving,
  } = useCatalogAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--chart-1))]/10 via-[hsl(var(--card))] to-[hsl(var(--chart-1))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--chart-1))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--chart-1))]/20 flex items-center justify-center">
            <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--chart-1))]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">Catálogo y tarifas</h1>
            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1 font-medium">
              {categories.length} oficios · los cambios quedan en el historial
            </p>
          </div>
        </div>
      </div>

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

      <AuditPanel />
    </div>
  );
};
