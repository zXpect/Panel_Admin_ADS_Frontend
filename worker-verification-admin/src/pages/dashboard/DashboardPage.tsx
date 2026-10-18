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
    <div className="space-y-8">
      {/* Header mejorado con animaciones */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/10 via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-4 sm:p-6 md:p-8 animate-slide-down">
        {/* Fondo animado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[hsl(var(--accent))]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 animate-slide-in-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shine-effect">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
              <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1">Resumen general del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Principal Cards - 3 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Workers */}
        <Link to="/workers" className="block group sm:col-span-2 md:col-span-1 animate-scale-in">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 transform hover:scale-[1.02] hover:-translate-y-1 shine-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Trabajadores
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--primary))]">{totalWorkersFiltered}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[hsl(var(--primary))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--primary))]/20 group-hover:scale-110">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
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
        <Link to="/clients" className="block group animate-scale-in animation-delay-100">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))]/40 transform hover:scale-[1.02] hover:-translate-y-1 shine-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Total Clientes
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--accent))]">
                  {stats?.clients.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[hsl(var(--accent))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--accent))]/20 group-hover:scale-110">
                <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[hsl(var(--accent))]" />
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--chart-2))] group-hover:animate-pulse" />
              <span className="text-[hsl(var(--muted-foreground))]">Clientes activos</span>
            </div>
          </div>
        </Link>

        {/* Pending Documents */}
        <Link to="/documents/pending" className="block group animate-scale-in animation-delay-200">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-[hsl(var(--border))] hover:border-[hsl(var(--chart-5))]/40 transform hover:scale-[1.02] hover:-translate-y-1 shine-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Docs Pendientes
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2 transition-colors group-hover:text-[hsl(var(--chart-5))]">
                  {stats?.documents.pending || 0}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[hsl(var(--chart-5))]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[hsl(var(--chart-5))]/20 group-hover:scale-110">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-[hsl(var(--chart-5))]" />
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-5))] animate-pulse"></div>
              Requieren revisión
            </div>
          </div>
        </Link>
      </div>

      {/* Métricas Secundarias - 4 columnas compactas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-3 sm:p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105 animate-fade-in">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase">Verificados</p>
              <p className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">{verifiedWorkers}</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-3 sm:p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-4))]/30 transition-all duration-300 hover:scale-105 animate-fade-in animation-delay-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(var(--chart-4))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-4))]/20 group-hover:scale-110">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--chart-4))]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase">Actividad</p>
              <p className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-4))] transition-colors">{activityRate}%</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-3 sm:p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105 animate-fade-in animation-delay-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase">Aprobados</p>
              <p className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">{stats?.documents.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="group bg-[hsl(var(--card))] rounded-xl shadow-sm p-3 sm:p-4 border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--chart-2))]/30 transition-all duration-300 hover:scale-105 animate-fade-in animation-delay-300">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(var(--chart-2))]/10 rounded-lg flex items-center justify-center transition-all group-hover:bg-[hsl(var(--chart-2))]/20 group-hover:scale-110">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--chart-2))]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase">Aprobación</p>
              <p className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--chart-2))] transition-colors">
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
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 border-2 border-[hsl(var(--border))] lg:col-span-2 hover:shadow-lg transition-all duration-300 animate-slide-up shine-effect">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))]">
                Tendencia de Actividad
              </h2>
            </div>
            <div className="inline-flex rounded-xl border-2 border-[hsl(var(--border))] p-1 bg-[hsl(var(--muted))] shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setTrendView('weekly')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${trendView === 'weekly'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]'
                  }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTrendView('monthly')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${trendView === 'monthly'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]'
                  }`}
              >
                Mensual
              </button>
            </div>
          </div>
          {isLoadingTrends ? (
            <div className="flex items-center justify-center h-[200px] sm:h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
          ) : trendsData && trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
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
            <div className="flex items-center justify-center h-[200px] sm:h-[300px] text-[hsl(var(--muted-foreground))]">
              No hay datos disponibles
            </div>
          )}
          {trendsSummary && (
            <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Trabajadores</p>
                <p className="text-lg sm:text-2xl font-bold text-[hsl(var(--foreground))]">{trendsSummary.totalWorkersActive}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Procesados</p>
                <p className="text-lg sm:text-2xl font-bold text-[hsl(var(--chart-2))]">{trendsSummary.totalDocsProcessed}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Subidos</p>
                <p className="text-lg sm:text-2xl font-bold text-[hsl(var(--chart-5))]">{trendsSummary.totalDocsUploaded}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trabajadores por Categoría */}
        {categoryData.length > 0 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 border border-[hsl(var(--border))] animate-slide-in-left shine-effect">
            <h2 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mb-4 sm:mb-6">
              Trabajadores por Categoría
            </h2>
            <ResponsiveContainer width="100%" height={250}>
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
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Estado de Trabajadores */}
        {workerStatusData.length > 0 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 border border-[hsl(var(--border))] animate-slide-in-right shine-effect">
            <h2 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mb-4 sm:mb-6">
              Estado de Trabajadores
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={workerStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workerStatusData.map((_entry, index) => (
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
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md p-4 sm:p-6 border border-[hsl(var(--border))] animate-slide-up shine-effect">
          <h2 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mb-4 sm:mb-6">
            Documentos Pendientes por Tipo
          </h2>
          <ResponsiveContainer width="100%" height={200}>
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