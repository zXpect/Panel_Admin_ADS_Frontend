// Orden de las tablas de clientes y trabajadores: por fecha de creación de la
// cuenta (createdAt, de Firebase Auth) o por nombre completo
export type AccountSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

export const ACCOUNT_SORT_OPTIONS: { value: AccountSort; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'name_asc', label: 'Nombre (A–Z)' },
  { value: 'name_desc', label: 'Nombre (Z–A)' },
];

interface SortableAccount {
  name?: string;
  lastName?: string;
  createdAt?: number | null;
}

const fullName = (account: SortableAccount) => `${account.name || ''} ${account.lastName || ''}`.trim();

// Sin distinguir mayúsculas ni tildes («Óscar» va con la O)
const collator = new Intl.Collator('es', { sensitivity: 'base' });

export const sortAccounts = <T extends SortableAccount>(accounts: T[], sort: AccountSort): T[] => {
  const sorted = [...accounts];
  if (sort === 'name_asc' || sort === 'name_desc') {
    const direction = sort === 'name_asc' ? 1 : -1;
    return sorted.sort((a, b) => direction * collator.compare(fullName(a), fullName(b)));
  }
  const direction = sort === 'oldest' ? 1 : -1;
  return sorted.sort((a, b) => {
    // Las cuentas sin fecha van siempre al final
    if (a.createdAt == null || b.createdAt == null) {
      return (a.createdAt == null ? 1 : 0) - (b.createdAt == null ? 1 : 0);
    }
    return direction * (a.createdAt - b.createdAt);
  });
};
