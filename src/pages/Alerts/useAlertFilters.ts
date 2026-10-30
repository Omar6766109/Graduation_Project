import { useState, useMemo } from 'react';
import type { Alert, Severity, AlertStatus } from '../../types';

// ─── Filter state shape ────────────────────────────────────────────────────────

export interface AlertFilters {
  search: string;
  severity: Severity | 'all';
  status: AlertStatus | 'all';
}

// ─── Sort state shape ─────────────────────────────────────────────────────────

export type SortField = 'timestamp' | 'severity' | 'status' | 'title';
export type SortDir   = 'asc' | 'desc';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high:     1,
  medium:   2,
  low:      3,
  info:     4,
};

const STATUS_ORDER: Record<AlertStatus, number> = {
  open:         0,
  acknowledged: 1,
  resolved:     2,
  dismissed:    3,
};

const PAGE_SIZE = 8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAlertFilters(alerts: Alert[]) {
  const [filters, setFilters] = useState<AlertFilters>({
    search:   '',
    severity: 'all',
    status:   'all',
  });
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [page,      setPage]      = useState(1);

  /** Update a single filter key and reset to page 1 */
  function updateFilter<K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  /** Toggle sort direction or change field */
  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  }

  /** Reset all filters */
  function resetFilters() {
    setFilters({ search: 'all' as unknown as string, severity: 'all', status: 'all' });
    // properly reset:
    setFilters({ search: '', severity: 'all', status: 'all' });
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return alerts.filter((a) => {
      if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
      if (filters.status   !== 'all' && a.status   !== filters.status)   return false;
      if (q && ![a.title, a.source, a.affectedHost ?? ''].some((f) => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [alerts, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'timestamp': cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); break;
        case 'severity':  cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];           break;
        case 'status':    cmp = STATUS_ORDER[a.status]     - STATUS_ORDER[b.status];               break;
        case 'title':     cmp = a.title.localeCompare(b.title);                                     break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);

  const paginated = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage],
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    page: safePage,
    setPage,
    totalPages,
    totalFiltered: filtered.length,
    pageSize: PAGE_SIZE,
    paginated,
  };
}
