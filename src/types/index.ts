// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'red_team' | 'blue_team' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

// ─── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string; // Lucide icon name
  roles?: UserRole[]; // undefined = all roles
  children?: NavItem[];
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';
export type AlertSource = 'red_team' | 'blue_team' | 'ids' | 'siem';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  source: AlertSource;
  timestamp: string;
  affectedHost?: string;
}

// ─── Scans ─────────────────────────────────────────────────────────────────────

export type ScanStatus = 'running' | 'completed' | 'failed' | 'queued';

export type ScanType =
  | 'network_recon'
  | 'vulnerability'
  | 'web_app'
  | 'port_scan'
  | 'compliance'
  | 'brute_force';

export interface ScanFinding {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  cve?: string;
  cvss?: number;
  affectedItem?: string;
  remediation?: string;
}

export interface Scan {
  id: string;
  name: string;
  target: string;
  status: ScanStatus;
  startedAt: string;
  completedAt?: string;
  findingsCount: number;
  scanType?: ScanType;
  duration?: string;
  scannerEngine?: string;
  parameters?: string;
  executedBy?: string;
  findings?: ScanFinding[];
}

// ─── Blue Team Monitoring ──────────────────────────────────────────────────────

export type SecurityEventType =
  | 'brute_force'
  | 'anomalous_traffic'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'malware'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'network_scan';

export type SecurityEventStatus =
  | 'open'
  | 'acknowledged'
  | 'investigating'
  | 'contained'
  | 'resolved'
  | 'dismissed';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  title: string;
  description: string;
  severity: Severity;
  source: AlertSource;
  sensor: string;
  sourceIp: string;
  sourcePort?: number;
  destinationIp: string;
  destinationPort?: number;
  affectedAsset: string;
  protocol?: string;
  status: SecurityEventStatus;
  rawLog?: string;
  iocs?: string[];
  mitreTechnique?: string;
  investigationSteps?: string[];
}

// ─── Vulnerabilities ───────────────────────────────────────────────────────────

export interface Vulnerability {
  id: string;
  cveId: string;
  title: string;
  severity: Severity;
  cvssScore: number;
  affectedService: string;
  remediation: string;
  discoveredAt: string;
}

// ─── Investigation ─────────────────────────────────────────────────────────────

export type InvestigationStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  phase: string;
  title: string;
  description: string;
  severity: Severity;
  sensor: string;
  mitreTactic?: string;
  mitreTechnique?: string;
  sourceIp?: string;
  destinationIp?: string;
  relatedEvidenceIds?: string[];
  rawTelemetry?: string;
}

export interface EvidenceItem {
  id: string;
  type: 'network' | 'endpoint' | 'file' | 'auth';
  title: string;
  details: Record<string, string>;
  rawSnippet?: string;
}

export interface AssociatedAssessment {
  scanId: string;
  scanName: string;
  target: string;
  scannerEngine: string;
  findingsCount: number;
  criticalCves: string[];
  correlationNotes: string;
}

export interface AiIncidentSummary {
  executiveSummary: string;
  rootCause: string;
  impactAssessment: string;
  confidenceScore: number;
  keyRiskIndicators: string[];
  generatedAt: string;
}

export interface PlaybookAction {
  id: string;
  phase: 'containment' | 'eradication' | 'recovery' | 'verification';
  title: string;
  description: string;
  targetAsset: string;
  commandSnippet?: string;
  simulatedStatus: 'pending' | 'applied';
  appliedAt?: string;
}

export interface Investigation {
  id: string;
  title: string;
  status: InvestigationStatus;
  severity: Severity;
  assignee: string;
  leadAnalystRole?: string;
  targetAsset: string;
  relatedAlerts: string[];
  createdAt: string;
  updatedAt: string;
  summary: string;
  timeline?: TimelineEvent[];
  evidence?: EvidenceItem[];
  associatedAssessment?: AssociatedAssessment;
  aiSummary?: AiIncidentSummary;
  playbookActions?: PlaybookAction[];
}

// ─── System Components ─────────────────────────────────────────────────────────

export type ComponentStatus = 'operational' | 'degraded' | 'offline';

// ─── Reports ───────────────────────────────────────────────────────────────────

export type ReportType =
  | 'executive_summary'
  | 'red_team_assessment'
  | 'blue_team_incident'
  | 'vulnerability_trend'
  | 'custom';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  generatedBy: string;
  downloadUrl?: string;
}
