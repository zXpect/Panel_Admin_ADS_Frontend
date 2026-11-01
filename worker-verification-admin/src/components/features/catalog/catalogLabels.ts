import { AuditEntity, TaskUnit } from '@/types/catalog.types';

export const UNIT_LABELS: Record<TaskUnit, string> = {
  visita: 'Visita',
  unidad: 'Unidad',
  m2: 'm²',
  jornada: 'Jornada',
};

export interface ConfigMeta {
  label: string;
  hint: string;
  prefix?: string;
  suffix?: string;
}

// Nombre y ayuda visibles de cada parámetro; los demás muestran su clave y descripción
export const CONFIG_LABELS: Record<string, ConfigMeta> = {
  quote_min_visit_fee_cop: { label: 'Tarifa mínima por visita', hint: 'Piso del precio de cualquier solicitud', prefix: '$' },
  quote_regional_factor_pct: { label: 'Factor regional', hint: 'Ajuste de la referencia de ciudades grandes para Ubaté (−15 = 15 % menos)', suffix: '%' },
  quote_max_price_cop: { label: 'Precio máximo de una cotización', hint: 'Tope del valor que puede cotizar un técnico', prefix: '$' },
  worker_max_categories: { label: 'Oficios máximos por trabajador', hint: 'Entre 1 y 7' },
  search_weight_distance: { label: 'Peso de la cercanía en la búsqueda', hint: 'Entre 0 y 1' },
  search_weight_rating: { label: 'Peso de la calificación en la búsqueda', hint: 'Entre 0 y 1' },
  search_neutral_rating: { label: 'Calificación de un técnico nuevo', hint: 'Se usa mientras no tiene calificaciones (0 a 5)', suffix: '★' },
};

export const CONFIG_GROUPS: { title: string; description: string; keys: string[] }[] = [
  {
    title: 'Cotización',
    description: 'Cómo se calcula el precio de referencia que ve el cliente.',
    keys: ['quote_min_visit_fee_cop', 'quote_regional_factor_pct', 'quote_max_price_cop'],
  },
  {
    title: 'Trabajadores y búsqueda',
    description: 'Cuántos oficios puede tener un técnico y cómo se ordenan los resultados.',
    keys: ['worker_max_categories', 'search_weight_distance', 'search_weight_rating', 'search_neutral_rating'],
  },
];

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  SystemConfig: 'Parámetro',
  ServiceCategory: 'Oficio',
  Task: 'Tarea',
  Account: 'Cuenta',
};

// Campos de los valores auditados, en el idioma del panel
export const AUDIT_FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  unit: 'Unidad',
  reference_min_cop: 'Mínimo',
  reference_max_cop: 'Máximo',
  source: 'Fuente',
  is_active: 'Activo',
  order: 'Orden',
  value: 'Valor',
  description: 'Descripción',
  category: 'Oficio',
  slug: 'Identificador',
};
