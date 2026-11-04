import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { registrarService } from '../services/registrar.service';
import { SlaTelemetryCard } from './reporting/SlaTelemetryCard';
import { BarChart3, FileSpreadsheet, Download, Layers } from 'lucide-react';

interface ReportingTabProps {
  graduates?: any[];
}

export const ReportingTab: React.FC<ReportingTabProps> = ({ graduates = [] }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLogs, setExportLogs] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    registrarService
      .getExportLogs()
      .then((logs) => {
        if (mounted) setExportLogs(logs || []);
      })
      .catch((err) => console.error('Failed to load logs:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalGrads = graduates.length;
  const avgCgpa = useMemo(() => {
    if (!graduates.length) return '0.00';
    const valid = graduates.map((g) => parseFloat(g.cgpa)).filter((g) => !isNaN(g) && g > 0);
    if (!valid.length) return '0.00';
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
  }, [graduates]);

  const verifiedPercent = useMemo(() => {
    if (!graduates.length) return 0;
    const verified = graduates.filter((g) => g.identityVerified).length;
    return Math.round((verified / graduates.length) * 100);
  }, [graduates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Academic Registrar Reports & SLA Telemetry</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Real-time fulfillment metrics, accreditation logs, and institutional document turnarounds.
          </p>
        </div>
      </div>

      {/* SLA Telemetry Card */}
      <SlaTelemetryCard />

      {/* Academic Coverage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Recorded Alumni</span>
          <div className="mt-2 text-3xl font-black text-[var(--text-primary)]">{totalGrads.toLocaleString()}</div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Archived from university SIS</p>
        </div>

        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Institutional Cumulative GPA</span>
          <div className="mt-2 text-3xl font-black text-sky-400">{avgCgpa}</div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Cohort average across engineering & sciences</p>
        </div>

        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Identity Verification Rate</span>
          <div className="mt-2 text-3xl font-black text-emerald-400">{verifiedPercent}%</div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Tamper-check seal issued</p>
        </div>
      </div>

      {/* Export Audit Logs Table */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Official Accreditation Exports & Logs</h3>
        {exportLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">No export logs recorded.</div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {exportLogs.slice(0, 5).map((log, idx) => (
              <div key={log.id || idx} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <div className="font-semibold text-[var(--text-secondary)]">{log.reportName || 'Graduating Class Summary'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{log.exportedBy || 'Registrar Officer'} · {log.recordCount || 0} records</div>
                </div>
                <span className="font-mono text-[var(--text-muted)]">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
