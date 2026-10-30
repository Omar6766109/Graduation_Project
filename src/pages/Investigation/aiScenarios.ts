import type { EvidenceItem } from '../../types';

export interface ScenarioRecommendation {
  phase: 'Containment' | 'Eradication' | 'Recovery' | 'Verification';
  action: string;
  targetAsset: string;
}

export interface ScenarioRiskFactor {
  risk: string;
  linkedEvidenceIds: string[];
}

export interface SimulatedAiScenario {
  id: string;
  incidentId: string;
  scenarioTitle: string;
  confidenceScore: number;
  confidenceExplanation: string;
  confidenceFactors: string[];
  executiveSummary: string;
  rootCause: {
    hypothesis: string;
    linkedEvidenceIds: string[];
    correlationNote: string;
  };
  impactAssessment: string;
  criticalRiskFactors: ScenarioRiskFactor[];
  recommendedSteps: ScenarioRecommendation[];
}

export interface AnalysisRunRecord {
  runNumber: number;
  runId: string;
  timestamp: string;
  scenarioId: string;
  scenarioTitle: string;
  confidenceScore: number;
  summarySnapshot: string;
  executiveSummary?: string;
  evidenceReferences?: string[];
  linkedEvidenceCount: number;
}

export const SIMULATED_AI_SCENARIOS: Record<string, SimulatedAiScenario[]> = {
  'INV-2026-001': [
    {
      id: 'SCN-INV1-01',
      incidentId: 'INV-2026-001',
      scenarioTitle: 'End-to-End Attack Chain Synthesis (Log4j + Sudoers + C2)',
      confidenceScore: 94,
      confidenceExplanation:
        'Simulated confidence calculated from 4 corroborated lab evidence artifacts with zero telemetry conflicts.',
      confidenceFactors: [
        'Deterministic correlation between Suricata C2 alert and network trace (EVD-01)',
        'Linux Auditd confirms UID 33 to EUID 0 privilege escalation (EVD-02)',
        'Wazuh FIM syscheck confirms crontab backdoor entry (EVD-03)',
        'PAM session log corroborates root interactive elevation (EVD-04)',
      ],
      executiveSummary:
        'High-confidence confirmation of an end-to-end multi-stage intrusion against DMZ web host web-srv-01. Initial entry succeeded via unauthenticated JNDI injection (CVE-2021-44228), followed by root escalation via a local sudoers wildcard entry. Outbound C2 communications and anomalous database data flow indicate the host is actively compromised.',
      rootCause: {
        hypothesis:
          'Unpatched Apache Log4j JNDI injection (CVE-2021-44228) in customer portal combined with an overly permissive /etc/sudoers wildcard rule granting www-data NOPASSWD root execution.',
        linkedEvidenceIds: ['EVD-02', 'EVD-04'],
        correlationNote:
          'Auditd execution record EVD-02 shows process apache2 (PID 1420) spawned bash under EUID 0 via sudo, confirmed by PAM authentication telemetry in EVD-04.',
      },
      impactAssessment:
        'Confidentiality and integrity severely impacted. Attacker holds root privileges on web-srv-01 with potential lateral pivot into VLAN 10 and VLAN 50. Database read-access compromised with 4.2 GB transmitted.',
      criticalRiskFactors: [
        {
          risk: 'Active C2 channel transmitting HTTP beacons to 203.0.113.99 every 60 seconds with zero jitter.',
          linkedEvidenceIds: ['EVD-01'],
        },
        {
          risk: 'Persistent cron task scheduled at */5 * * * * executes staged payload /tmp/.c_cache/c.sh.',
          linkedEvidenceIds: ['EVD-03'],
        },
        {
          risk: 'Interactive root shell (EUID 0) allows memory dumping and evasion of user-space monitoring.',
          linkedEvidenceIds: ['EVD-02', 'EVD-04'],
        },
        {
          risk: 'Outbound session volume of 14.8 MB over 180 sessions indicates active command-and-control.',
          linkedEvidenceIds: ['EVD-01'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Isolate web-srv-01 to quarantine VLAN 999 and block egress to 203.0.113.99 on perimeter firewall.',
          targetAsset: 'web-srv-01 & Perimeter FW',
        },
        {
          phase: 'Eradication',
          action: 'Terminate rogue process PID 3912, purge /tmp/.c_cache/c.sh, and remove malicious deploy crontab.',
          targetAsset: 'web-srv-01 (192.168.1.10)',
        },
        {
          phase: 'Recovery',
          action: 'Upgrade Log4j package to version 2.17.1+ and remove NOPASSWD wildcard line from /etc/sudoers.',
          targetAsset: 'web-srv-01 (192.168.1.10)',
        },
        {
          phase: 'Verification',
          action: 'Dispatch verification scan SCN-002 against web-srv-01:8080 to confirm vulnerability closure.',
          targetAsset: 'http://web-srv-01:8080',
        },
      ],
    },
    {
      id: 'SCN-INV1-02',
      incidentId: 'INV-2026-001',
      scenarioTitle: 'Lateral Pivot & Internal Subnet Staging Correlation',
      confidenceScore: 91,
      confidenceExplanation:
        'Simulated confidence calculated from crontab staging destination correlation and auditd session commands.',
      confidenceFactors: [
        'Cron payload script targets internal staging host 192.168.1.200 (EVD-03)',
        'Auditd log confirms 4m 12s active root session for credential discovery (EVD-02)',
        'Correlates with Red Team scan SCN-002 reconnaissance findings',
      ],
      executiveSummary:
        'Simulated deep-pivot correlation focusing on post-exploitation staging. Following root elevation on web-srv-01, adversary established staging connections to internal IP 192.168.1.200 and enumerated database credentials. Immediate threat lies in east-west expansion across the DMZ.',
      rootCause: {
        hypothesis:
          'Compromised web-srv-01 root environment used as an unauthorized operational beachhead to reach internal subnet services.',
        linkedEvidenceIds: ['EVD-02', 'EVD-03'],
        correlationNote:
          'Cron persistence script (EVD-03) explicitly downloads payloads from internal lab IP 192.168.1.200, proving internal lateral pivot or local staging.',
      },
      impactAssessment:
        'Potential breach of internal database tier db-srv-01 and adjacent management controllers. East-west traffic requires containment.',
      criticalRiskFactors: [
        {
          risk: 'Internal staging host 192.168.1.200 hosting c.sh may be a secondary compromised node.',
          linkedEvidenceIds: ['EVD-03'],
        },
        {
          risk: 'Root session duration of 4m 12s allowed adversary to harvest database connection secrets.',
          linkedEvidenceIds: ['EVD-02'],
        },
        {
          risk: 'High-frequency beaconing to 203.0.113.99 indicates exfiltration control channel is operational.',
          linkedEvidenceIds: ['EVD-01'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Place internal host 192.168.1.200 under security hold and inspect running web services.',
          targetAsset: 'Internal Host (192.168.1.200)',
        },
        {
          phase: 'Eradication',
          action: 'Revoke and rotate all database service credentials and API tokens stored on web-srv-01.',
          targetAsset: 'db-srv-01 & api-gw-01',
        },
        {
          phase: 'Verification',
          action: 'Analyze Suricata flow logs between DMZ VLAN 50 and internal database VLAN 10.',
          targetAsset: 'Suricata Flow Engine',
        },
      ],
    },
    {
      id: 'SCN-INV1-03',
      incidentId: 'INV-2026-001',
      scenarioTitle: 'Persistence Mechanics & Evasion Resilience Audit',
      confidenceScore: 96,
      confidenceExplanation:
        'Simulated confidence calculated from deterministic crontab file hash and process tree corroboration.',
      confidenceFactors: [
        'SHA-256 hash match on staged payload /tmp/.c_cache/c.sh (EVD-03)',
        'Auditd PID tracking confirms parent process apache2 spawned privileged shell (EVD-02)',
        'PAM authentication log confirms interactive session opening under UID 0 (EVD-04)',
      ],
      executiveSummary:
        'Specialized persistence and defense evasion evaluation confirms that attacker mechanisms are resilient to standard process termination. Crontab schedule re-executes the payload every 5 minutes with zero jitter, maintaining continuous access.',
      rootCause: {
        hypothesis:
          'Insecure write permissions and lack of file integrity enforcement on crontab directories enabled silent backdoor planting under deploy user.',
        linkedEvidenceIds: ['EVD-03', 'EVD-04'],
        correlationNote:
          'Crontab entry at /var/spool/cron/crontabs/deploy executes curl to /bin/bash every 5 minutes under deploy account with root sudoers access.',
      },
      impactAssessment:
        'Standard reboot or process termination will fail to dislodge the attacker without complete crontab directory sanitization.',
      criticalRiskFactors: [
        {
          risk: 'Backdoor automatically respawns every 5 minutes via cron task scheduler.',
          linkedEvidenceIds: ['EVD-03'],
        },
        {
          risk: 'Fixed 60-second C2 beacon with zero jitter suggests scripted, non-human beaconing.',
          linkedEvidenceIds: ['EVD-01'],
        },
        {
          risk: 'PAM authentication log confirms interactive session opening under UID 0.',
          linkedEvidenceIds: ['EVD-04'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Stop cron daemon (systemctl stop cron) and disable automated task scheduling during triage.',
          targetAsset: 'web-srv-01 (192.168.1.10)',
        },
        {
          phase: 'Eradication',
          action: 'Remove /var/spool/cron/crontabs/deploy and clean /tmp/.c_cache directory.',
          targetAsset: 'web-srv-01 (192.168.1.10)',
        },
        {
          phase: 'Verification',
          action: 'Verify zero rogue scheduled tasks exist across /etc/cron* and user spool directories.',
          targetAsset: 'Wazuh FIM (syscheck)',
        },
      ],
    },
  ],

  'INV-2026-002': [
    {
      id: 'SCN-INV2-01',
      incidentId: 'INV-2026-002',
      scenarioTitle: 'Pass-the-Hash & NTLMv1 Downgrade Vector Analysis',
      confidenceScore: 89,
      confidenceExplanation:
        'Simulated confidence calculated from Active Directory Event ID 4624 telemetry and client IP correlation.',
      confidenceFactors: [
        'Event ID 4624 confirms Type 3 network logon using legacy NTLM V1 (EVD-201)',
        'Source workstation WKSTN-14 (192.168.1.88) mapped to student lab segment',
        'Correlates with BloodHound attack path flagged in Red Team audit SCN-007',
      ],
      executiveSummary:
        'Pass-the-hash intrusion detected from compromised student endpoint wkstn-14 toward primary domain controller dc-01. Compromised administrator credentials represent immediate risk to the entire directory forest.',
      rootCause: {
        hypothesis:
          'Cached NTLM credentials on unmanaged client workstation without Credential Guard enabled, paired with legacy NTLMv1 acceptance on domain controller.',
        linkedEvidenceIds: ['EVD-201'],
        correlationNote:
          'Active Directory security log EVD-201 confirms Logon Type 3 network authentication using NTLM V1 originating from WKSTN-14 for Domain Administrator.',
      },
      impactAssessment:
        'Entire directory forest potentially exposed to rogue Kerberos ticket forgery (Golden Ticket). Domain Controller administration compromised.',
      criticalRiskFactors: [
        {
          risk: 'NTLMv1 protocol accepted on primary Domain Controller allows offline hash cracking.',
          linkedEvidenceIds: ['EVD-201'],
        },
        {
          risk: 'High-privilege admin account active on student lab endpoint wkstn-14.',
          linkedEvidenceIds: ['EVD-201'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Isolate workstation wkstn-14 from corporate VLAN and trigger memory acquisition.',
          targetAsset: 'wkstn-14 (192.168.1.88)',
        },
        {
          phase: 'Eradication',
          action: 'Reset KRBTGT account password twice to invalidate all forged Kerberos tickets.',
          targetAsset: 'dc-01.lab.local',
        },
        {
          phase: 'Recovery',
          action: 'Enforce SMB signing and disable NTLMv1 domain-wide via Group Policy.',
          targetAsset: 'Domain Policy',
        },
      ],
    },
    {
      id: 'SCN-INV2-02',
      incidentId: 'INV-2026-002',
      scenarioTitle: 'Active Directory Forest Kerberos Compromise Assessment',
      confidenceScore: 93,
      confidenceExplanation:
        'Simulated confidence derived from Domain Controller logon telemetry and SMB signing audit findings.',
      confidenceFactors: [
        'Domain Controller logon record EVD-201 confirms Administrator identity impersonation',
        'Assessment SCN-007 confirms missing SMB signing allows NTLM relay attacks',
        'High correlation with Kerberoasting risks documented in pingcastle audit',
      ],
      executiveSummary:
        'Simulated directory replication threat synthesis. The adversary replayed Domain Administrator credentials over network logon Type 3. Without SMB signing, this allows arbitrary remote RPC execution against dc-01.',
      rootCause: {
        hypothesis:
          'Lack of SMB packet signing and NTLMv1 compatibility policy enabled credential interception and relay from client subnets.',
        linkedEvidenceIds: ['EVD-201'],
        correlationNote:
          'Authentication telemetry confirms NTLMv1 usage; legacy compatibility settings allowed relay without challenge-response signing.',
      },
      impactAssessment:
        'Active Directory database (NTDS.dit) subject to replication extraction. Full administrative takeover.',
      criticalRiskFactors: [
        {
          risk: 'Domain Administrator credentials replayed without MFA or Kerberos pre-authentication.',
          linkedEvidenceIds: ['EVD-201'],
        },
        {
          risk: 'Source IP 192.168.1.88 has direct Layer-2 network reachability to Domain Controller.',
          linkedEvidenceIds: ['EVD-201'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Temporarily block RPC and SMB traffic from subnet 192.168.1.0/24 to Domain Controller except via bastion.',
          targetAsset: 'dc-01.lab.local',
        },
        {
          phase: 'Recovery',
          action: 'Deploy Protected Users security group policy and restrict Domain Admin logon to Tier 0 assets.',
          targetAsset: 'Active Directory',
        },
        {
          phase: 'Verification',
          action: 'Audit security event logs for Event IDs 4672 (special privileges assigned) and 4768 (TGT requests).',
          targetAsset: 'Wazuh Agent dc-01',
        },
      ],
    },
  ],

  'INV-2026-003': [
    {
      id: 'SCN-INV3-01',
      incidentId: 'INV-2026-003',
      scenarioTitle: 'Ransomware Behavioral Heuristic & Containment Verification',
      confidenceScore: 98,
      confidenceExplanation:
        'Simulated confidence calculated from quarantined binary SHA-256 match and FIM rapid encryption heuristic.',
      confidenceFactors: [
        'Quarantined binary sample EVD-301 verified with SHA-256 and ImpHash match',
        'Wazuh HIDS FIM detected 2,400 user document extensions altered to .locked in 180s',
        'Automated EDR containment rule terminated process before network propagation',
      ],
      executiveSummary:
        'Ransomware outbreak successfully thwarted on finance workstation wkstn-09. File encryption was contained after 3 minutes. Zero ransom communications occurred and offline backups verified intact.',
      rootCause: {
        hypothesis:
          'Unsigned malicious executable svchost32.exe launched from C:\\Users\\Public without application whitelisting.',
        linkedEvidenceIds: ['EVD-301'],
        correlationNote:
          'Binary artifact EVD-301 matches known mock ransomware heuristics; execution path C:\\Users\\Public bypassed default folder restrictions.',
      },
      impactAssessment:
        'Limited to single workstation. 2,400 user documents temporarily renamed to .locked; clean recovery via Volume Shadow Copies.',
      criticalRiskFactors: [
        {
          risk: 'Executable svchost32.exe masqueraded as legitimate Windows service binary name.',
          linkedEvidenceIds: ['EVD-301'],
        },
        {
          risk: 'Rapid mass encryption pace (2,400 files in 180 seconds) confirms high-speed cryptographic routine.',
          linkedEvidenceIds: ['EVD-301'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Verify workstation wkstn-09 remains isolated on quarantine VLAN.',
          targetAsset: 'wkstn-09 (192.168.1.74)',
        },
        {
          phase: 'Recovery',
          action: 'Verify Volume Shadow Copy restoration of user files and confirm checksum integrity.',
          targetAsset: 'wkstn-09 (192.168.1.74)',
        },
        {
          phase: 'Verification',
          action: 'Push AppLocker rule blocking binary execution from C:\\Users\\Public domain-wide.',
          targetAsset: 'Group Policy',
        },
      ],
    },
    {
      id: 'SCN-INV3-02',
      incidentId: 'INV-2026-003',
      scenarioTitle: 'Malware Ingress Pathway & Container Registry Staging Review',
      confidenceScore: 95,
      confidenceExplanation:
        'Simulated confidence derived from binary artifact hash and container scan SCN-010 exposure correlation.',
      confidenceFactors: [
        'Binary artifact EVD-301 SHA-256 matches staging payload found in lab container repository',
        'Assessment SCN-010 confirms exposed Docker API allowing container injection (CVE-2019-5736)',
        'Endpoint network log confirms download from internal registry IP 192.168.10.15',
      ],
      executiveSummary:
        'Forensic staging analysis correlates the malicious binary on wkstn-09 with an unsecured internal staging container repository flagged in assessment SCN-010. The malware was downloaded via an internal build script before detonation.',
      rootCause: {
        hypothesis:
          'Internal container registry vulnerability allowed attacker to inject compiled binary into developer staging pipeline.',
        linkedEvidenceIds: ['EVD-301'],
        correlationNote:
          'SHA-256 checksum in EVD-301 matches artifact staged inside lab registry test container.',
      },
      impactAssessment:
        'Workstation contained; however, internal build and container infrastructure requires immediate image provenance validation.',
      criticalRiskFactors: [
        {
          risk: 'Internal developer images may contain secondary staged binaries.',
          linkedEvidenceIds: ['EVD-301'],
        },
        {
          risk: 'Endpoint execution policies did not restrict developer container output directories.',
          linkedEvidenceIds: ['EVD-301'],
        },
      ],
      recommendedSteps: [
        {
          phase: 'Containment',
          action: 'Quarantine affected Docker registry namespace on 192.168.10.15.',
          targetAsset: 'Registry Host (192.168.10.15)',
        },
        {
          phase: 'Eradication',
          action: 'Purge infected container tags and rotate registry access credentials.',
          targetAsset: 'Docker Registry',
        },
        {
          phase: 'Verification',
          action: 'Run Trivy scan against all active container images to confirm zero malware binaries.',
          targetAsset: 'SCN-010 Scanner',
        },
      ],
    },
  ],
};

export function getScenariosForIncident(incidentId: string): SimulatedAiScenario[] {
  return SIMULATED_AI_SCENARIOS[incidentId] ?? [];
}

export function findEvidenceById(evidenceList: EvidenceItem[] | undefined, id: string): EvidenceItem | undefined {
  if (!evidenceList) return undefined;
  return evidenceList.find((e) => e.id.toLowerCase() === id.toLowerCase());
}

// ─── LocalStorage Persistence Helpers ──────────────────────────────────────────

const AI_HISTORY_STORAGE_PREFIX = 'cyberdefense_ai_history_';
const AI_ACTIVE_RUN_STORAGE_PREFIX = 'cyberdefense_ai_active_run_';

export function getStoredAiHistory(incidentId: string): AnalysisRunRecord[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${AI_HISTORY_STORAGE_PREFIX}${incidentId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const validated: AnalysisRunRecord[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.runNumber === 'number' &&
        typeof item.scenarioId === 'string' &&
        typeof item.timestamp === 'string' &&
        typeof item.confidenceScore === 'number'
      ) {
        validated.push({
          runNumber: item.runNumber,
          runId: typeof item.runId === 'string' ? item.runId : `RUN-${item.runNumber}`,
          timestamp: item.timestamp,
          scenarioId: item.scenarioId,
          scenarioTitle: typeof item.scenarioTitle === 'string' ? item.scenarioTitle : 'Correlated Scenario',
          confidenceScore: item.confidenceScore,
          summarySnapshot: typeof item.summarySnapshot === 'string' ? item.summarySnapshot : '',
          executiveSummary: typeof item.executiveSummary === 'string' ? item.executiveSummary : undefined,
          evidenceReferences: Array.isArray(item.evidenceReferences) ? item.evidenceReferences : [],
          linkedEvidenceCount:
            typeof item.linkedEvidenceCount === 'number'
              ? item.linkedEvidenceCount
              : Array.isArray(item.evidenceReferences)
              ? item.evidenceReferences.length
              : 0,
        });
      }
    }
    return validated.length > 0 ? validated : null;
  } catch (err) {
    console.warn(`Failed to read AI history for ${incidentId} from localStorage:`, err);
    return null;
  }
}

export function saveStoredAiHistory(incidentId: string, history: AnalysisRunRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${AI_HISTORY_STORAGE_PREFIX}${incidentId}`, JSON.stringify(history));
  } catch (err) {
    console.warn(`Failed to save AI history for ${incidentId} to localStorage:`, err);
  }
}

export function getStoredActiveRunNumber(incidentId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${AI_ACTIVE_RUN_STORAGE_PREFIX}${incidentId}`);
    if (!raw) return null;
    const num = parseInt(raw, 10);
    return isNaN(num) ? null : num;
  } catch (err) {
    console.warn(`Failed to read active AI run for ${incidentId} from localStorage:`, err);
    return null;
  }
}

export function saveStoredActiveRunNumber(incidentId: string, runNumber: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${AI_ACTIVE_RUN_STORAGE_PREFIX}${incidentId}`, runNumber.toString());
  } catch (err) {
    console.warn(`Failed to save active AI run for ${incidentId} to localStorage:`, err);
  }
}
