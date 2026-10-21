import { useState } from 'react';
import { Receipt, Search, Wallet, Banknote, CreditCard, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePayments } from '@/hooks/usePayments';
import { Pagination } from '@/components/common/Pagination';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn, formatDate, formatPrice } from '@/lib/utils/helpers';
import { PaymentFilters, PaymentGateway, PaymentStatus } from '@/types/payment.types';

// El backend pagina de a 20 (REST_FRAMEWORK.PAGE_SIZE)
const PAGE_SIZE = 20;

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  DECLINED: 'Rechazado',
  ERROR: 'Error',
  VOIDED: 'Anulado',
};

// Estado siempre con texto e ícono, no solo color
const STATUS_STYLES: Record<PaymentStatus, { className: string; icon: typeof Clock }> = {
  PENDING: { className: 'chip-warning', icon: Clock },
  APPROVED: { className: 'chip-success', icon: CheckCircle },
  DECLINED: { className: 'chip-danger', icon: XCircle },
  ERROR: { className: 'chip-danger', icon: XCircle },
  VOIDED: { className: 'chip-neutral', icon: Ban },
};

const GATEWAY_LABELS: Record<PaymentGateway, string> = {
  wompi: 'Wompi (digital)',
  cash: 'Efectivo',
  mock: 'Simulado',
};

const inputClass = 'field';

const shortId = (value: string) => (value.length > 10 ? `${value.slice(0, 10)}…` : value);

export const TransactionsPage = () => {
  const [filters, setFilters] = useState<PaymentFilters>({ status: '', gateway: '', page: 1 });
  const { payments, count, summary, isLoading, isFetching } = usePayments(filters);

  // Cualquier cambio de filtro vuelve a la primera página
  const setFilter = (changes: Partial<PaymentFilters>) =>
    setFilters((current) => ({ ...current, ...changes, page: 1 }));

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const byGateway = summary?.approved_by_gateway || {};

  return (
    <div className="space-y-6">
      <PageHeader icon={CreditCard} title="Transacciones"
        subtitle="Pagos digitales (Wompi Sandbox) y en efectivo registrados en ADS" />

      {/* Resumen de aprobados con los filtros actuales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={Wallet} label="Total aprobado"
          value={formatPrice(summary?.approved_total_cop || 0)}
          detail={`${summary?.approved_count || 0} pagos aprobados`} />
        <SummaryCard icon={CreditCard} label="Digital (Wompi)"
          value={formatPrice(byGateway.wompi?.total_cop || 0)}
          detail={`${byGateway.wompi?.count || 0} pagos`} />
        <SummaryCard icon={Banknote} label="Efectivo"
          value={formatPrice(byGateway.cash?.total_cop || 0)}
          detail={`${byGateway.cash?.count || 0} pagos`} />
      </div>

      {/* Filtros */}
      <div className="panel p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Estado
          <select className={inputClass} value={filters.status}
            onChange={(e) => setFilter({ status: e.target.value as PaymentStatus | '' })}>
            <option value="">Todos</option>
            {(Object.keys(STATUS_LABELS) as PaymentStatus[]).map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Medio de pago
          <select className={inputClass} value={filters.gateway}
            onChange={(e) => setFilter({ gateway: e.target.value as PaymentGateway | '' })}>
            <option value="">Todos</option>
            <option value="wompi">{GATEWAY_LABELS.wompi}</option>
            <option value="cash">{GATEWAY_LABELS.cash}</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Desde
          <input type="date" className={inputClass} value={filters.date_from || ''}
            onChange={(e) => setFilter({ date_from: e.target.value })} />
        </label>
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Hasta
          <input type="date" className={inputClass} value={filters.date_to || ''}
            onChange={(e) => setFilter({ date_to: e.target.value })} />
        </label>
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] space-y-1">
          Solicitud
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input type="text" placeholder="ID de la solicitud" className={cn(inputClass, 'pl-9')}
              value={filters.service_request_id || ''}
              onChange={(e) => setFilter({ service_request_id: e.target.value.trim() })} />
          </div>
        </label>
      </div>

      {/* Tabla */}
      <div className={cn(
        'panel overflow-hidden transition-opacity',
        isFetching && !isLoading && 'opacity-70'
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">No hay transacciones con estos filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Solicitud</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(new Date(payment.created_at).getTime())}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                    <TableCell className="font-mono text-xs" title={payment.service_request_id}>
                      {shortId(payment.service_request_id)}
                    </TableCell>
                    <TableCell>{GATEWAY_LABELS[payment.gateway] || payment.gateway}</TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      {formatPrice(payment.amount_cop)}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {count > PAGE_SIZE && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          itemsPerPage={PAGE_SIZE}
          totalItems={count}
        />
      )}
    </div>
  );
};

interface SummaryCardProps {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
}

const SummaryCard = ({ icon: Icon, label, value, detail }: SummaryCardProps) => (
  <div className="panel p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center">
      <Icon className="w-5 h-5" strokeWidth={1.9} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))] truncate">{value}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
    </div>
  </div>
);

const StatusChip = ({ status }: { status: PaymentStatus }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = style.icon;
  return (
    <span className={`chip ${style.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {STATUS_LABELS[status] || status}
    </span>
  );
};
