import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services/dashboardService';
import { Users, UserCheck, Clock, TrendingUp, Activity, CheckCircle2, FileText, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Link } from 'react-router-dom';
import { WORKER_CATEGORIES, workToCategorySlug } from '@/lib/utils/constants';
import { ReactNode, useState } from 'react';
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

  // byCategory viene agrupado por el texto crudo de `work` ('Electricista', 'Plomería'...):
  // se suma cada valor en su oficio oficial y se descarta lo que no es un oficio (Ferretería).
  const countsBySlug: Record<string, number> = {};
  Object.entries(stats?.workers.byCategory ?? {}).forEach(([work, count]) => {
    const slug = workToCategorySlug(work);
    if (slug) countsBySlug[slug] = (countsBySlug[slug] || 0) + (count || 0);
  });

  const totalWorkersFiltered = WORKER_CATEGORIES.reduce((acc, category) => {
    return acc + (countsBySlug[category.slug] || 0);
  }, 0);

  const verifiedWorkers = stats?.workers.verified || 0;
  const processedDocuments = stats?.documents.processed || 0;

  const categoryData = WORKER_CATEGORIES.map(category => ({
    name: category.name,
    value: countsBySlug[category.slug] || 0
  })).filter(item => item.value > 0);

  const documentTypeData = [
    { name: 'Hoja de Vida', value: stats?.documents.pendingByType?.hojaDeVida || 0 },
    { name: 'Antecedentes', value: stats?.documents.pendingByType?.antecedentesJudiciales || 0 },
    { name: 'Títulos', value: stats?.documents.pendingByType?.titulos || 0 },
    { name: 'Cartas', value: stats?.documents.pendingByType?.cartasRecomendacion || 0 }
  ].filter(item => item.value > 0);

  // Como el mockup: disponibles y no disponibles, con el total en el centro
  const workerStatusData = [
    { name: 'No disponibles', value: Math.max(0, (stats?.workers.total || 0) - (stats?.workers.available || 0)), color: 'hsl(var(--chart-2))' },
    { name: 'Disponibles', value: stats?.workers.available || 0, color: 'hsl(var(--primary))' },
  ];

  const trendsData = trendView === 'weekly' ? weeklyTrends?.trends : monthlyTrends?.trends;
  const trendsSummary = trendView === 'weekly' ? weeklyTrends?.summary : monthlyTrends?.summary;
  const isLoadingTrends = trendView === 'weekly' ? isLoadingWeekly : isLoadingMonthly;
  const activityRate = stats?.workers.total ? Math.round((stats.workers.online / stats.workers.total) * 100) : 0;

  const approvalRate = processedDocuments > 0
    ? Math.round(((stats?.documents.approved || 0) / processedDocuments) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="Dashboard" subtitle="Resumen general del sistema" />

      {/* Indicadores principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard to="/workers" icon={Users} label="Total trabajadores" value={totalWorkersFiltered}
          detail={<><span>{stats?.workers.available || 0} disponibles</span><span>{stats?.workers.online || 0} en línea</span></>} />
        <KpiCard to="/clients" icon={UserCheck} label="Total clientes" value={stats?.clients.total || 0}
          detail="Clientes registrados" />
        <KpiCard to="/documents/pending" icon={Clock} label="Docs pendientes" value={stats?.documents.pending || 0}
          detail="Requieren revisión" />
      </div>

      {/* Indicadores secundarios */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={CheckCircle2} label="Verificados" value={verifiedWorkers} />
        <MiniStat icon={Activity} label="Actividad" value={`${activityRate}%`} />
        <MiniStat icon={FileText} label="Aprobados" value={stats?.documents.approved || 0} />
        <MiniStat icon={TrendingUp} label="Aprobación" value={`${approvalRate}%`} />
      </div>

      {/* Tendencia */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            Tendencia de actividad
          </h2>
          <div className="inline-flex rounded-xl p-1 bg-[hsl(var(--secondary))]" role="tablist" aria-label="Periodo">
            {(['weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                role="tab"
                aria-selected={trendView === view}
                onClick={() => setTrendView(view)}
                className={`px-4 min-h-[36px] text-sm font-semibold rounded-lg transition-colors ${trendView === view
                  ? 'bg-[hsl(var(--navy))] text-[hsl(var(--on-navy))] dark:bg-[hsl(var(--primary))] dark:text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--secondary-foreground))]'}`}
              >
                {view === 'weekly' ? 'Semanal' : 'Mensual'}
              </button>
            ))}
          </div>
        </div>
        {isLoadingTrends ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        ) : trendsData && trendsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendsData}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey={trendView === 'weekly' ? 'day' : 'week'} tickLine={false} axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 13 }} />
              <Line type="linear" dataKey="workers" name="Trabajadores registrados" stroke="hsl(var(--chart-1))"
                strokeWidth={2} dot={{ r: 3.5, fill: 'hsl(var(--chart-1))' }} />
              <Line type="linear" dataKey="documents" name="Documentos procesados" stroke="hsl(var(--chart-2))"
                strokeWidth={2} dot={{ r: 3.5, fill: 'hsl(var(--chart-2))' }} />
              <Line type="linear" dataKey="documentsUploaded" name="Documentos subidos" stroke="hsl(var(--chart-1))"
                strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3.5, fill: 'hsl(var(--chart-1))' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-[hsl(var(--muted-foreground))]">
            No hay datos disponibles
          </div>
        )}
        {trendsSummary && (
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))] text-center">
            <SummaryValue label="Trabajadores" value={trendsSummary.totalWorkersActive} />
            <SummaryValue label="Procesados" value={trendsSummary.totalDocsProcessed} />
            <SummaryValue label="Subidos" value={trendsSummary.totalDocsUploaded} highlight />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trabajadores por oficio */}
        <section className="panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            Trabajadores por categoría
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 20, left: 24, right: 8 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Trabajadores" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} maxBarSize={36}
                  label={{ position: 'top', fontSize: 11, fill: 'hsl(var(--foreground))' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin trabajadores con oficio</p>
          )}
        </section>

        {/* Disponibles y no disponibles */}
        <section className="panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            Estado de trabajadores
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-[180px] h-[180px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workerStatusData} dataKey="value" innerRadius={58} outerRadius={84} startAngle={90} endAngle={-270}
                    stroke="none">
                    {workerStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold">
                {stats?.workers.total || 0}
              </span>
            </div>
            <ul className="space-y-3 text-sm w-full max-w-[220px]">
              {workerStatusData.map((entry) => (
                <li key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: entry.color }} />
                  <span className="flex-1">{entry.name}</span>
                  <span className="font-bold">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Documentos pendientes por tipo */}
      {documentTypeData.length > 0 && (
        <section className="panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            Documentos pendientes por tipo
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={documentTypeData} layout="vertical" margin={{ right: 24 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="value" name="Pendientes" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} maxBarSize={26}
                label={{ position: 'right', fontSize: 12, fill: 'hsl(var(--foreground))' }} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  color: 'hsl(var(--popover-foreground))',
  fontSize: 13,
};

interface KpiCardProps {
  to: string;
  icon: LucideIcon;
  label: string;
  value: number;
  detail: ReactNode;
}

const KpiCard = ({ to, icon: Icon, label, value, detail }: KpiCardProps) => (
  <Link to={to} className="panel p-5 block hover:border-[hsl(var(--primary))] transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="text-[34px] leading-[44px] font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
          {value}
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center">
        <Icon className="w-5 h-5" strokeWidth={1.9} />
      </div>
    </div>
    <div className="mt-2 flex gap-4 text-sm text-[hsl(var(--muted-foreground))]">{detail}</div>
  </Link>
);

const MiniStat = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) => (
  <div className="panel p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5" strokeWidth={1.9} />
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  </div>
);

const SummaryValue = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
  <div>
    <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
    <p className={`text-2xl font-extrabold ${highlight ? 'text-[hsl(var(--brand-text))]' : ''}`}>{value}</p>
  </div>
);
