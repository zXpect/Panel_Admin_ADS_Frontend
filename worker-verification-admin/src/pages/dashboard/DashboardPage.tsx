import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services/dashboardService';
import { Users, UserCheck, Clock, TrendingUp, Activity, CheckCircle2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WORKER_CATEGORIES } from '@/lib/utils/constants';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  DashboardStats,
  TrendsResponse,
  WeeklyTrend,
  MonthlyTrend
} from '@/types/api.types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const DashboardPage = () => {
  const [trendView, setTrendView] = useState<'weekly' | 'monthly'>('weekly');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: weeklyTrends, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['dashboard', 'weekly-trends'],
    queryFn: () => dashboardService.getWeeklyTrends(),
    enabled: trendView === 'weekly',
  });

  const { data: monthlyTrends, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['dashboard', 'monthly-trends'],
    queryFn: () => dashboardService.getMonthlyTrends(),
    enabled: trendView === 'monthly',
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

  const verifiedWorkers = stats?.workers.verified || 0;
  const processedDocuments = stats?.documents.processed || 0;

  const categoryData = WORKER_CATEGORIES.map(category => ({
    name: category,
    value: stats?.workers.byCategory?.[category] || 0
  })).filter(item => item.value > 0);

  const documentTypeData = [
    { name: 'Hoja de Vida', value: stats?.documents.pendingByType?.hojaDeVida || 0 },
    { name: 'Antecedentes', value: stats?.documents.pendingByType?.antecedentesJudiciales || 0 },
    { name: 'Títulos', value: stats?.documents.pendingByType?.titulos || 0 },
    { name: 'Cartas', value: stats?.documents.pendingByType?.cartasRecomendacion || 0 }
  ].filter(item => item.value > 0);

  const workerStatusData = [
    { name: 'En Línea', value: stats?.workers.online || 0 },
    { name: 'Disponibles', value: Math.max(0, (stats?.workers.available || 0) - (stats?.workers.online || 0)) },
    { name: 'Ocupados', value: Math.max(0, (stats?.workers.total || 0) - (stats?.workers.available || 0)) }
  ].filter(item => item.value > 0);

  const trendsData = trendView === 'weekly' ? weeklyTrends?.trends : monthlyTrends?.trends;
  const trendsSummary = trendView === 'weekly' ? weeklyTrends?.summary : monthlyTrends?.summary;
  const isLoadingTrends = trendView === 'weekly' ? isLoadingWeekly : isLoadingMonthly;
  const activityRate = stats?.workers.total ? Math.round((stats.workers.online / stats.workers.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/10 via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">Resumen general del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Principal Cards - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Workers */}
        <Link to="/workers" className="block group">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 transform hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Trabajadores
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--primary))]">{totalWorkersFiltered}</p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--primary))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--primary))]/20 group-hover:scale-110">
                <Users className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse"></div>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {stats?.workers.available || 0} disponibles
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {stats?.workers.online || 0} en línea
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Total Clients */}
        <Link to="/clients" className="block group">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))]/40 transform hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Clientes
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--accent))]">
                  {stats?.clients.total || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--accent))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--accent))]/20 group-hover:scale-110">
                <UserCheck className="w-7 h-7 text-[hsl(var(--accent))]" />
              </div>
            </div>
            <div className="mt-4 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--chart-2))] group-hover:animate-pulse" />
              <span className="text-[hsl(var(--muted-foreground))]">Clientes activos</span>
            </div>
          </div>
        </Link>

        {/* Pending Documents */}
        <Link to="/documents/pending" className="block group">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--chart-5))]/40 transform hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Documentos Pendientes
                </p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--chart-5))]">
                  {stats?.documents.pending || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-[hsl(var(--chart-5))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--chart-5))]/20 group-hover:scale-110">
                <Clock className="w-7 h-7 text-[hsl(var(--chart-5))]" />
              </div>
            </div>
            <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-5))] animate-pulse"></div>
              Requieren revisión
            </div>
          </div>
        </Link>
      </div>

      {/* Métricas Secundarias - 4 columnas compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">Verificados</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">{verifiedWorkers}</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-4))]/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--chart-4))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-4))]/20 group-hover:scale-110">
              <Activity className="w-5 h-5 text-[hsl(var(--chart-4))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">Tasa Actividad</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-4))] transition-colors">{activityRate}%</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <FileText className="w-5 h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">Aprobados</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">{stats?.documents.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">Tasa Aprobación</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">
                {processedDocuments > 0
                  ? Math.round(((stats?.documents.approved || 0) / processedDocuments) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas Principales - Layout 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias */}
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border-2 border-[hsl(var(--border))] lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                Tendencia de Actividad
              </h2>
            </div>
            <div className="inline-flex rounded-xl border-2 border-[hsl(var(--border))] p-1 bg-[hsl(var(--muted))] shadow-sm">
              <button
                onClick={() => setTrendView('weekly')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${trendView === 'weekly'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]'
                  }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTrendView('monthly')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${trendView === 'monthly'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]'
                  }`}
              >
                Mensual
              </button>
            </div>
          </div>
          {isLoadingTrends ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
          ) : trendsData && trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[hsl(var(--muted))]" opacity={0.3} />
                <XAxis 
                  dataKey={trendView === 'weekly' ? 'day' : 'week'}
                  className="text-[hsl(var(--muted-foreground))]"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  className="text-[hsl(var(--muted-foreground))]"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workers"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Trabajadores registrados"
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="documents"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Documentos procesados"
                  dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="documentsUploaded"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  name="Documentos subidos"
                  dot={{ fill: 'hsl(var(--chart-5))', r: 4 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[hsl(var(--muted-foreground))]">
              No hay datos disponibles
            </div>
          )}
                    {trendsSummary && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div className="text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Trabajadores Activos</p>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{trendsSummary.totalWorkersActive}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Docs Procesados</p>
                <p className="text-2xl font-bold text-[hsl(var(--chart-2))]">{trendsSummary.totalDocsProcessed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Docs Subidos</p>
                <p className="text-2xl font-bold text-[hsl(var(--chart-5))]">{trendsSummary.totalDocsUploaded}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trabajadores por Categoría */}
        {categoryData.length > 0 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border border-[hsl(var(--border))]">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
              Trabajadores por Categoría
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[hsl(var(--muted))]" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  className="text-[hsl(var(--muted-foreground))]"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-[hsl(var(--muted-foreground))]"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Bar dataKey="value" name="Trabajadores" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Estado de Trabajadores */}
        {workerStatusData.length > 0 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border border-[hsl(var(--border))]">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
              Estado de Trabajadores
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workerStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['hsl(var(--chart-2))', 'hsl(var(--primary))', 'hsl(var(--chart-5))'][index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Documentos Pendientes por Tipo - Ancho Completo */}
      {documentTypeData.length > 0 && (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-6 border border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
            Documentos Pendientes por Tipo
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={documentTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-[hsl(var(--muted))]" opacity={0.3} />
              <XAxis
                type="number"
                className="text-[hsl(var(--muted-foreground))]"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                className="text-[hsl(var(--muted-foreground))]"
                style={{ fontSize: '12px' }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};