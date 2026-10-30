import { useState, useEffect } from 'react';
import { X, Play, Crosshair, AlertTriangle } from 'lucide-react';
import type { Scan, ScanType } from '../../types';
import { cn } from '../../utils';
import { SCAN_TYPE_CONFIG } from '../../constants';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchScan: (scan: Scan) => void;
}

export default function NewScanModal({ isOpen, onClose, onLaunchScan }: NewScanModalProps) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState<ScanType>('vulnerability');
  const [scannerEngine, setScannerEngine] = useState('Nmap 7.94 + Nuclei v3.2');
  const [profile, setProfile] = useState<'stealth' | 'standard' | 'aggressive'>('standard');
  const [parameters, setParameters] = useState('-sS -sV -O --top-ports 1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Adjust default parameters when scanType changes
  function handleTypeChange(t: ScanType) {
    setScanType(t);
    switch (t) {
      case 'network_recon':
        setParameters('nmap -sn 192.168.1.0/24 -T3');
        setScannerEngine('Nmap 7.94');
        break;
      case 'vulnerability':
        setParameters('openvas-cli --target-ip --profile="Full and fast"');
        setScannerEngine('OpenVAS / Greenbone');
        break;
      case 'web_app':
        setParameters('nuclei -u <target> -tags cve,xss,sqli -rate-limit 150');
        setScannerEngine('OWASP ZAP + Nuclei');
        break;
      case 'port_scan':
        setParameters('masscan -p1-65535 --rate=1000');
        setScannerEngine('Masscan 1.3');
        break;
      case 'compliance':
        setParameters('oscap xccdf eval --profile cis_level2_server');
        setScannerEngine('OpenSCAP 1.3.8');
        break;
      case 'brute_force':
        setParameters('hydra -L wordlists/users.txt -P wordlists/pass.txt -t 4');
        setScannerEngine('Hydra v9.5');
        break;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a descriptive scan name.');
      return;
    }
    if (!target.trim()) {
      setError('Please provide a target host, IP, or CIDR subnet.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate launch dispatch delay
    setTimeout(() => {
      const newScan: Scan = {
        id: `SCN-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        target: target.trim(),
        scanType,
        status: 'running',
        startedAt: new Date().toISOString(),
        duration: 'Just started',
        findingsCount: 0,
        scannerEngine,
        parameters: parameters.trim() || undefined,
        executedBy: 'Red Team Analyst (You)',
        findings: [],
      };

      onLaunchScan(newScan);
      setIsSubmitting(false);
      onClose();

      // Reset form
      setName('');
      setTarget('');
      setError('');
    }, 450);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-scan-title"
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden z-10 space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center cyber-glow-cyan shrink-0">
              <Crosshair size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 id="new-scan-title" className="text-base font-semibold text-slate-100">
                Launch New Red Team Scan
              </h2>
              <p className="text-xs text-slate-400">Simulate an offensive security reconnaissance scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Simulation Notice Banner */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold">Simulated Workflow:</span> This will add an interactive scan record to the platform state for demonstration purposes. No live packets or attacks will be transmitted across real networks.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Scan Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Scan Task Name</label>
            <input
              type="text"
              placeholder="e.g. DMZ Subnet Full Vulnerability Sweep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Target Host / Range */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target IP / Subnet / URL
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.0/24 or http://web-srv-01:8080"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
            />
          </div>

          {/* Grid: Type & Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scan Type</label>
              <select
                value={scanType}
                onChange={(e) => handleTypeChange(e.target.value as ScanType)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.entries(SCAN_TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scanner Engine</label>
              <input
                type="text"
                value={scannerEngine}
                onChange={(e) => setScannerEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Scan Intensity Profile */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Scan Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {(['stealth', 'standard', 'aggressive'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setProfile(mode)}
                  className={cn(
                    'py-1.5 px-3 rounded-lg text-xs font-medium capitalize border transition-all',
                    profile === mode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200',
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Command Parameters */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Simulated CLI Arguments
            </label>
            <input
              type="text"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Play size={13} className="fill-current" />
              {isSubmitting ? 'Dispatching…' : 'Launch Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
