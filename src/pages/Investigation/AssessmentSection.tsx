import { Crosshair, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AssociatedAssessment } from '../../types';

interface AssessmentSectionProps {
  assessment?: AssociatedAssessment;
}

export default function AssessmentSection({ assessment }: AssessmentSectionProps) {
  if (!assessment) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-slate-500 space-y-2">
        <Crosshair size={32} className="mx-auto text-slate-600" />
        <h4 className="text-sm font-semibold text-slate-300">No Assessment Linked</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This investigation is not yet formally correlated with a completed Red Team scan. You can review all active assessments in the Red Team dashboard.
        </p>
        <Link
          to="/red-team"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-2"
        >
          Browse Red Team Scans <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <Crosshair size={16} className="text-red-400" />
          Associated Offensive Assessment Linkage
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Correlation between prior Red Team security assessments and the current incident breach vectors
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6 border border-slate-700/60 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                {assessment.scanId}
              </span>
              <span className="text-xs text-slate-400">• Completed Assessment</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">{assessment.scanName}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Target: {assessment.target}</p>
          </div>

          <Link
            to="/red-team"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-cyan-400 border border-slate-700 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
          >
            Open in Red Team Scans <ArrowRight size={13} />
          </Link>
        </div>

        {/* Scan Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Scanner Tooling</span>
            <p className="text-xs font-medium text-slate-200 mt-0.5">{assessment.scannerEngine}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Findings Identified</span>
            <p className="text-xs font-bold text-red-400 mt-0.5">
              {assessment.findingsCount} Vulnerabilities Discovered
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Assessment Link</span>
            <p className="text-xs font-medium text-green-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} /> Verified Root Cause
            </p>
          </div>
        </div>

        {/* Critical CVEs */}
        {assessment.criticalCves.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-300 mb-2">Correlated Vulnerability Identifiers:</p>
            <div className="flex flex-wrap gap-2">
              {assessment.criticalCves.map((cve) => (
                <span
                  key={cve}
                  className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-medium"
                >
                  {cve}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Root Cause Correlation Narrative */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
          <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
            Assessment Correlation & Root-Cause Insight:
          </p>
          <p className="text-slate-300 leading-relaxed">{assessment.correlationNotes}</p>
        </div>
      </div>
    </div>
  );
}
