import { useState, useMemo } from 'react';
import type { SecurityEvent, Severity, SecurityEventType, SecurityEventStatus } from '../../types';

// ─── Filter state shape ────────────────────────────────────────────────────────

export interface EventFilters {
  search: string;
  severity: Severity | 'all';
  eventType: SecurityEventType | 'all';
  status: SecurityEventStatus | 'all';
}

// ─── Sort state shape ─────────────────────────────────────────────────────────

export type SortField = 'timestamp' | 'title' | 'severity' | 'status' | 'affectedAsset';
export type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const STATUS_ORDER: Record<SecurityEventStatus, number> = {
  open: 0,
  acknowledged: 1,
  investigating: 2,
  contained: 3,
  resolved: 4,
  dismissed: 5,
};

const PAGE_SIZE = 8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEventFilters(events: SecurityEvent[]) {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    severity: 'all',
    eventType: 'all',
    status: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  /** Update a single filter key and reset to page 1 */
  function updateFilter<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
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
    setFilters({ search: '', severity: 'all', eventType: 'all', status: 'all' });
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return events.filter((e) => {
      if (filters.severity !== 'all' && e.severity !== filters.severity) return false;
      if (filters.eventType !== 'all' && e.eventType !== filters.eventType) return false;
      if (filters.status !== 'all' && e.status !== filters.status) return false;
      if (
        q &&
        ![
          e.id,
          e.title,
          e.description,
          e.sourceIp,
          e.destinationIp,
          e.affectedAsset,
          e.sensor,
          e.eventType,
          e.protocol ?? '',
        ].some((field) => field.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [events, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'timestamp':
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'severity':
          cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'affectedAsset':
          cmp = a.affectedAsset.localeCompare(b.affectedAsset);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

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
