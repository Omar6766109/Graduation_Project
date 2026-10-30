import type {
  NavItem,
  Severity,
  AlertSource,
  ScanStatus,
  ScanType,
  InvestigationStatus,
  SecurityEventType,
} from '../types';

// ─── Navigation Items ──────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      path: '/',               icon: 'LayoutDashboard' },
  { label: 'Alerts',         path: '/alerts',         icon: 'Bell' },
  {
    label: 'Red Team',
    path: '/red-team',
    icon: 'Crosshair',
    roles: ['admin', 'red_team'],
  },
  {
    label: 'Blue Team',
    path: '/blue-team',
    icon: 'Shield',
    roles: ['admin', 'blue_team'],
  },
  { label: 'Investigation',  path: '/investigation',  icon: 'Search' },
  { label: 'Reports',        path: '/reports',        icon: 'FileBarChart' },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['admin'],
  },
];

// ─── Severity Config ───────────────────────────────────────────────────────────

export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string; border: string }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  low: {
    label: 'Low',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  info: {
    label: 'Info',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
};

// ─── Alert Source Config ───────────────────────────────────────────────────────

export const ALERT_SOURCE_CONFIG: Record<AlertSource, { label: string; color: string }> = {
  red_team: { label: 'Red Team',  color: 'text-red-400' },
  blue_team: { label: 'Blue Team', color: 'text-blue-400' },
  ids:       { label: 'IDS',       color: 'text-purple-400' },
  siem:      { label: 'SIEM',      color: 'text-cyan-400' },
};

// ─── Scan Status Config ────────────────────────────────────────────────────────

export const SCAN_STATUS_CONFIG: Record<ScanStatus, { label: string; color: string; dot: string }> = {
  running:   { label: 'Running',   color: 'text-cyan-400',   dot: 'bg-cyan-400' },
  completed: { label: 'Completed', color: 'text-green-400',  dot: 'bg-green-400' },
  failed:    { label: 'Failed',    color: 'text-red-400',    dot: 'bg-red-400' },
  queued:    { label: 'Queued',    color: 'text-yellow-400', dot: 'bg-yellow-400' },
};

// ─── Scan Type Config ──────────────────────────────────────────────────────────

export const SCAN_TYPE_CONFIG: Record<
  ScanType,
  { label: string; color: string; bg: string; border: string }
> = {
  network_recon: {
    label: 'Network Recon',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  vulnerability: {
    label: 'Vulnerability Scan',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  web_app: {
    label: 'Web Application',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  port_scan: {
    label: 'Port Discovery',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  compliance: {
    label: 'Compliance Audit',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  brute_force: {
    label: 'Auth Stress Test',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
};

// ─── Security Event Type Config (Blue Team) ───────────────────────────────────

export const EVENT_TYPE_CONFIG: Record<
  SecurityEventType,
  { label: string; color: string; bg: string; border: string }
> = {
  brute_force: {
    label: 'Brute Force',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  anomalous_traffic: {
    label: 'Anomalous Traffic',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  privilege_escalation: {
    label: 'Privilege Escalation',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  lateral_movement: {
    label: 'Lateral Movement',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  malware: {
    label: 'Malware / Ransomware',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
  },
  data_exfiltration: {
    label: 'Data Exfiltration',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
  },
  policy_violation: {
    label: 'Policy Violation',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  network_scan: {
    label: 'Network Scan',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
};

// ─── Investigation Status Config ───────────────────────────────────────────────

export const INVESTIGATION_STATUS_CONFIG: Record<
  InvestigationStatus,
  { label: string; color: string }
> = {
  open:        { label: 'Open',        color: 'text-yellow-400' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400' },
  resolved:    { label: 'Resolved',    color: 'text-green-400' },
  closed:      { label: 'Closed',      color: 'text-slate-400' },
};

// ─── App Metadata ──────────────────────────────────────────────────────────────

export const APP_NAME = 'CyberDefense';
export const APP_SUBTITLE = 'Red–Blue Defense Platform';
