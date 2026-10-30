import { useState, useMemo } from 'react';
import type { Scan, ScanStatus, ScanType } from '../../types';

// ─── Filter state shape ────────────────────────────────────────────────────────

export interface ScanFilters {
  search: string;
  status: ScanStatus | 'all';
  scanType: ScanType | 'all';
}

// ─── Sort state shape ─────────────────────────────────────────────────────────

export type SortField = 'startedAt' | 'name' | 'status' | 'findingsCount' | 'target';
export type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<ScanStatus, number> = {
  running: 0,
  queued: 1,
  completed: 2,
  failed: 3,
};

const PAGE_SIZE = 8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScanFilters(scans: Scan[]) {
  const [filters, setFilters] = useState<ScanFilters>({
    search: '',
    status: 'all',
    scanType: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('startedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  /** Update a single filter key and reset to page 1 */
  function updateFilter<K extends keyof ScanFilters>(key: K, value: ScanFilters[K]) {
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
    setFilters({ search: '', status: 'all', scanType: 'all' });
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return scans.filter((s) => {
      if (filters.status !== 'all' && s.status !== filters.status) return false;
      if (filters.scanType !== 'all' && s.scanType !== filters.scanType) return false;
      if (
        q &&
        ![
          s.name,
          s.target,
          s.id,
          s.scannerEngine ?? '',
          s.scanType ?? '',
          s.parameters ?? '',
        ].some((f) => f.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [scans, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'startedAt':
          cmp = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'target':
          cmp = a.target.localeCompare(b.target);
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'findingsCount':
          cmp = a.findingsCount - b.findingsCount;
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
