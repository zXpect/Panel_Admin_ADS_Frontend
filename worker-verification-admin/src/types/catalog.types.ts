// Catálogo de oficios y tareas, parámetros de cotización y auditoría (HU-29, A4)

export type TaskUnit = 'visita' | 'unidad' | 'm2' | 'jornada';

export interface CatalogTask {
  id: number;
  category: string; // slug del oficio
  slug: string;
  name: string;
  unit: TaskUnit;
  // Referencia de ciudades grandes; el backend aplica el factor regional al estimar.
  // null en las dos: la tarea no tiene rango y el técnico la cotiza
  reference_min_cop: number | null;
  reference_max_cop: number | null;
  source: string;
  is_active: boolean;
  order: number;
}

export interface CatalogCategory {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  order: number;
  tasks: CatalogTask[];
}

export type CatalogTaskInput = Partial<Omit<CatalogTask, 'id'>>;

export interface CatalogCategoryInput {
  name?: string;
  is_active?: boolean;
  order?: number;
}

export interface SystemConfigItem {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export type AuditEntity = 'SystemConfig' | 'ServiceCategory' | 'Task' | 'Account';

export interface AuditLogEntry {
  id: number;
  admin: string;
  entity: AuditEntity;
  entity_key: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  data: AuditLogEntry[];
}
