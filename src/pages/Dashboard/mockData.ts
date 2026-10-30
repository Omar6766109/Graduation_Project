import type { Alert, Scan, Severity, ComponentStatus } from '../../types';

// Re-export for convenience so consumers can import from one place
export type { ComponentStatus };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns an ISO string offset by `minutes` from now */
function minsAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

// ─── Mock Alerts ──────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    title: 'Brute-Force Login Attempt Detected',
    description: 'Multiple failed SSH login attempts from external IP 203.0.113.42.',
    severity: 'critical',
    status: 'open',
    source: 'ids',
    timestamp: minsAgo(4),
    affectedHost: '192.168.1.10',
  },
  {
    id: 'ALT-002',
    title: 'Privilege Escalation via Sudo Misconfiguration',
    description: 'User "www-data" gained root via a misconfigured sudoers entry.',
    severity: 'critical',
    status: 'open',
    source: 'siem',
    timestamp: minsAgo(17),
    affectedHost: 'web-srv-01',
  },
  {
    id: 'ALT-003',
    title: 'Port Scan Detected on DMZ Subnet',
    description: 'Nmap SYN scan observed across 192.168.50.0/24 from internal host.',
    severity: 'high',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: minsAgo(42),
    affectedHost: '192.168.50.0/24',
  },
  {
    id: 'ALT-004',
    title: 'Outbound C2 Beacon Traffic',
    description: 'Periodic HTTP beaconing to known C2 domain every 60s.',
    severity: 'high',
    status: 'open',
    source: 'siem',
    timestamp: minsAgo(68),
    affectedHost: 'wkstn-14',
  },
  {
    id: 'ALT-005',
    title: 'SQL Injection Attempt on Login Endpoint',
    description: "Malicious payload detected in POST /api/auth/login: ' OR 1=1--",
    severity: 'high',
    status: 'resolved',
    source: 'ids',
    timestamp: minsAgo(95),
    affectedHost: 'api-gw-01',
  },
  {
    id: 'ALT-006',
    title: 'Unusual Outbound Data Transfer',
    description: 'Host transferred 4.2 GB to external IP outside business hours.',
    severity: 'medium',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: minsAgo(130),
    affectedHost: 'db-srv-02',
  },
  {
    id: 'ALT-007',
    title: 'Expired TLS Certificate on API Gateway',
    description: 'TLS certificate for api.internal.lab expired 3 days ago.',
    severity: 'medium',
    status: 'open',
    source: 'blue_team',
    timestamp: minsAgo(210),
    affectedHost: 'api-gw-01',
  },
  {
    id: 'ALT-008',
    title: 'Failed Wazuh Agent Heartbeat',
    description: 'Wazuh agent on db-srv-03 has not reported in 15 minutes.',
    severity: 'low',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: minsAgo(280),
    affectedHost: 'db-srv-03',
  },
  {
    id: 'ALT-009',
    title: 'Cron Job Added by Non-Admin User',
    description: 'User "deploy" added a cron entry on wkstn-07 without approval.',
    severity: 'low',
    status: 'open',
    source: 'siem',
    timestamp: minsAgo(360),
    affectedHost: 'wkstn-07',
  },
  {
    id: 'ALT-010',
    title: 'ICMP Flood Detected',
    description: 'Spike in ICMP echo requests from 192.168.1.50 — possible ping flood.',
    severity: 'info',
    status: 'dismissed',
    source: 'ids',
    timestamp: minsAgo(420),
    affectedHost: '192.168.1.50',
  },
];

// ─── Mock Scans ───────────────────────────────────────────────────────────────

export const MOCK_SCANS: Scan[] = [
  {
    id: 'SCN-001',
    name: 'Full Lab Network Recon',
    target: '192.168.1.0/24',
    status: 'running',
    startedAt: minsAgo(22),
    findingsCount: 0,
  },
  {
    id: 'SCN-002',
    name: 'Web Application Vulnerability Scan',
    target: 'http://web-srv-01:8080',
    status: 'completed',
    startedAt: minsAgo(180),
    completedAt: minsAgo(120),
    findingsCount: 14,
  },
  {
    id: 'SCN-003',
    name: 'Service Enumeration — DMZ',
    target: '192.168.50.0/24',
    status: 'completed',
    startedAt: minsAgo(300),
    completedAt: minsAgo(260),
    findingsCount: 6,
  },
  {
    id: 'SCN-004',
    name: 'SSH Brute-Force Simulation',
    target: '192.168.1.10',
    status: 'failed',
    startedAt: minsAgo(400),
    completedAt: minsAgo(395),
    findingsCount: 0,
  },
  {
    id: 'SCN-005',
    name: 'Database Port Exposure Check',
    target: 'db-srv-01, db-srv-02',
    status: 'queued',
    startedAt: minsAgo(5),
    findingsCount: 0,
  },
];

// ─── Derived Summary Metrics ──────────────────────────────────────────────────

export interface MetricSummary {
  totalAlerts: number;
  criticalAlerts: number;
  activeScans: number;
  monitoredAssets: number;
}

export const MOCK_METRICS: MetricSummary = {
  totalAlerts: MOCK_ALERTS.length,
  criticalAlerts: MOCK_ALERTS.filter((a) => a.severity === 'critical').length,
  activeScans: MOCK_SCANS.filter((s) => s.status === 'running' || s.status === 'queued').length,
  monitoredAssets: 38,
};

// ─── Severity Distribution (for chart) ────────────────────────────────────────

export interface SeverityCount {
  severity: Severity;
  count: number;
}

export function getSeverityDistribution(alerts: Alert[]): SeverityCount[] {
  const order: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
  return order.map((severity) => ({
    severity,
    count: alerts.filter((a) => a.severity === severity).length,
  }));
}

// ─── System Status ────────────────────────────────────────────────────────────

export interface SystemComponent {
  id: string;
  name: string;
  description: string;
  status: ComponentStatus;
  latencyMs?: number;
  lastChecked: string;
}

export const MOCK_SYSTEM_STATUS: SystemComponent[] = [
  {
    id: 'wazuh',
    name: 'Wazuh SIEM',
    description: 'Security event collection & correlation',
    status: 'operational',
    latencyMs: 12,
    lastChecked: minsAgo(1),
  },
  {
    id: 'red-scanner',
    name: 'Red Team Scanner',
    description: 'Authorized vulnerability & recon engine',
    status: 'operational',
    latencyMs: 34,
    lastChecked: minsAgo(1),
  },
  {
    id: 'ids',
    name: 'Network IDS',
    description: 'Intrusion detection sensor (Suricata)',
    status: 'operational',
    latencyMs: 8,
    lastChecked: minsAgo(1),
  },
  {
    id: 'api',
    name: 'Platform API',
    description: 'Core backend REST API gateway',
    status: 'degraded',
    latencyMs: 980,
    lastChecked: minsAgo(2),
  },
  {
    id: 'log-collector',
    name: 'Log Collector',
    description: 'Filebeat / Logstash agent pipeline',
    status: 'operational',
    latencyMs: 21,
    lastChecked: minsAgo(1),
  },
  {
    id: 'vuln-db',
    name: 'Vulnerability DB',
    description: 'Local CVE database mirror',
    status: 'offline',
    lastChecked: minsAgo(15),
  },
];

// ─── Scan type label helper ───────────────────────────────────────────────────

export const SCAN_TYPE_LABELS: Record<string, string> = {
  'SCN-001': 'Network Recon',
  'SCN-002': 'Web App Scan',
  'SCN-003': 'Service Enum',
  'SCN-004': 'Brute-Force Sim',
  'SCN-005': 'Port Exposure',
};

// ─── Trend data (last 7 days, mock) ──────────────────────────────────────────

export interface TrendPoint {
  day: string;
  critical: number;
  high: number;
  medium: number;
}

function dayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export const MOCK_TREND: TrendPoint[] = [
  { day: dayLabel(6), critical: 1, high: 3, medium: 5 },
  { day: dayLabel(5), critical: 3, high: 5, medium: 7 },
  { day: dayLabel(4), critical: 2, high: 4, medium: 4 },
  { day: dayLabel(3), critical: 4, high: 6, medium: 8 },
  { day: dayLabel(2), critical: 2, high: 3, medium: 6 },
  { day: dayLabel(1), critical: 5, high: 7, medium: 9 },
  { day: dayLabel(0), critical: 2, high: 3, medium: 4 },
];
