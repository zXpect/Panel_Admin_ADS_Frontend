import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services/dashboardService';
import { Users, UserCheck, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WORKER_CATEGORIES } from '@/lib/utils/constants';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  const totalWorkersFiltered = WORKER_CATEGORIES.reduce((acc, category) => {
    const count = stats?.workers.byCategory?.[category] || 0;
    return acc + count;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Workers */}
        <Link to="/workers" className="block">
          <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Trabajadores
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{totalWorkersFiltered}</p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <div className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              <span className="text-[hsl(var(--chart-2))] dark:text-[hsl(var(--chart-2))] font-medium">
                {stats?.workers.available || 0} disponibles
              </span>
              {' · '}
              <span className="text-[hsl(var(--primary))] font-medium">
                {stats?.workers.online || 0} en línea
              </span>
            </div>
          </div>
        </Link>

        {/* Total Clients */}
        <Link to="/clients" className="block">
          <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Clientes
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">
                  {stats?.clients.total || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--accent))]/10 dark:bg-[hsl(var(--accent))]/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-[hsl(var(--accent))]" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Documents */}
        <Link to="/documents/pending" className="block">
          <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Documentos Pendientes
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">
                  {stats?.documents.pendingTotal || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--chart-5))]/10 dark:bg-[hsl(var(--chart-5))]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-7 h-7 text-[hsl(var(--chart-5))]" />
              </div>
            </div>
            <div className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Requieren revisión</div>
          </div>
        </Link>

        {/* Documents by Type */}
        <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Por Tipo
            </p>
            <div className="w-14 h-14 bg-[hsl(var(--chart-3))]/10 dark:bg-[hsl(var(--chart-3))]/20 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-[hsl(var(--chart-3))]" />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {Object.entries(stats?.documents.pendingByType || {}).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))] capitalize">{label.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium text-[hsl(var(--foreground))]">{value || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workers by Category */}
      {stats?.workers.byCategory && (
        <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
            Trabajadores por Categoría
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {WORKER_CATEGORIES.map((category) => (
              <div key={category} className="bg-[hsl(var(--muted))] dark:bg-[hsl(var(--secondary))] rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {stats.workers.byCategory[category] || 0}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 text-center">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};