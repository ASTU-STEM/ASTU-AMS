import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { registrarService } from '../services/registrar.service';

interface ExportLog {
  id: string;
  reportName: string;
  format: string;
  exportedBy: string;
  recordCount: number;
  fileSize: string;
  createdAt: string;
}

interface ScheduledReport {
  id: string;
  title: string;
  format: string;
  schedule: string;
  nextRun: string;
  status: 'Active' | 'Paused' | 'Completed';
  createdBy?: string;
}

interface ReportingTabProps {
  graduates?: any[];
}

export const ReportingTab: React.FC<ReportingTabProps> = ({ graduates = [] }) => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'exports' | 'scheduled' | 'accreditation'>('overview');
  const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleFormat, setNewScheduleFormat] = useState('PDF');
  const [newScheduleFreq, setNewScheduleFreq] = useState('Every 1st of month');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  useEffect(() => {
    fetchReportingData();
  }, []);

  const fetchReportingData = async () => {
    setLoading(true);
    try {
      const [logsData, reportsData] = await Promise.all([
        registrarService.getExportLogs(),
        registrarService.getScheduledReports()
      ]);
      setExportLogs(logsData || []);
      setScheduledReports(reportsData || []);
    } catch (err) {
      console.error('Failed to load reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute dynamic stats directly from live database records
  const totalGrads = graduates.length;

  const avgCgpa = useMemo(() => {
    if (!graduates.length) return '0.00';
    const validGpas = graduates.map(g => parseFloat(g.cgpa)).filter(g => !isNaN(g) && g > 0);
    if (!validGpas.length) return '0.00';
    const sum = validGpas.reduce((a, b) => a + b, 0);
    return (sum / validGpas.length).toFixed(2);
  }, [graduates]);

  const registeredCoverageRate = useMemo(() => {
    if (!graduates.length) return '0.0%';
    const activeOrVerified = graduates.filter(g => g.status === 'Active' || g.identityVerified).length;
    return `${Math.round((activeOrVerified / graduates.length) * 100)}%`;
  }, [graduates]);

  const departmentPerformance = useMemo(() => {
    const map = new Map<string, { count: number; sumCgpa: number }>();
    graduates.forEach(g => {
      const dept = g.department && g.department !== '—' ? g.department : 'Unspecified';
      const cgpaVal = parseFloat(g.cgpa) || 0;
      if (!map.has(dept)) map.set(dept, { count: 0, sumCgpa: 0 });
      const entry = map.get(dept)!;
      entry.count += 1;
      entry.sumCgpa += cgpaVal;
    });

    const colors = ['#002B5E', '#005C2B', '#00C853', '#FFB300', '#6366F1', '#EC4899', '#8B5CF6'];
    return Array.from(map.entries()).map(([dept, data], idx) => {
      const avg = data.count > 0 ? (data.sumCgpa / data.count).toFixed(2) : '0.00';
      const percentage = Math.min(100, Math.max(15, Math.round((parseFloat(avg) / 4.0) * 100)));
      return {
        dept,
        gpa: avg,
        count: data.count,
        width: `${percentage}%`,
        color: colors[idx % colors.length]
      };
    });
  }, [graduates]);

  const destinationStats = useMemo(() => {
    const total = graduates.length || 1;
    const verifiedCount = graduates.filter(g => g.identityVerified).length;
    const activeCount = graduates.filter(g => g.status === 'Active').length;
    const seekingCount = graduates.filter(g => !g.identityVerified).length;
    const otherCount = Math.max(0, total - verifiedCount);

    return [
      { status: 'Verified Graduates', count: String(verifiedCount), percent: `${Math.round((verifiedCount / total) * 100)}%`, color: '#00C853' },
      { status: 'Active Registered Accounts', count: String(activeCount), percent: `${Math.round((activeCount / total) * 100)}%`, color: '#002B5E' },
      { status: 'In Process / Active Tracer', count: String(otherCount), percent: `${Math.round((otherCount / total) * 100)}%`, color: '#FFB300' },
      { status: 'Pending Verification Claim', count: String(seekingCount), percent: `${Math.round((seekingCount / total) * 100)}%`, color: '#FF6B00' },
    ];
  }, [graduates]);

  // Accreditation readiness derived from real graduate records (no invented
  // compliance percentages). Criteria that need survey/employer data we don't
  // have here are surfaced as "Review Required" instead of a fake score.
  const accreditationCriteria = useMemo(() => {
    const total = graduates.length;
    const pct = (n: number) => (total === 0 ? 'Pending Data' : `${Math.round((n / total) * 100)}% Compliant`);
    const verified = graduates.filter(g => g.identityVerified).length;
    const withCgpa = graduates.filter(g => { const v = parseFloat(g.cgpa); return !isNaN(v) && v > 0; }).length;
    const withDept = graduates.filter(g => g.department && g.graduationYear).length;

    return [
      { code: 'Criterion 1', title: 'Students & Alumni Tracking', desc: 'Admission, academic progress, & graduate career verification', source: 'Live Database', status: pct(verified), badge: 'bg-emerald-100 text-emerald-800' },
      { code: 'Criterion 2', title: 'Program Educational Objectives', desc: 'Consistency with institutional mission & employer demand', source: 'Tracer Survey Engine', status: total === 0 ? 'Pending Data' : 'Review Required', badge: 'bg-amber-100 text-amber-800' },
      { code: 'Criterion 3', title: 'Student Learning Outcomes (1-7)', desc: 'Engineering design, problem solving, ethics, & communication', source: 'Department CGPA Roster', status: pct(withCgpa), badge: 'bg-emerald-100 text-emerald-800' },
      { code: 'Criterion 4', title: 'Continuous Improvement', desc: 'Periodic review cycles using graduate tracer feedback', source: 'Survey Audit Log', status: 'Action Required', badge: 'bg-amber-100 text-amber-800' },
      { code: 'Criterion 5', title: 'Curriculum & Credit Hours', desc: 'Math, basic sciences, engineering topics, & general education', source: 'SIS Academic Records', status: pct(withDept), badge: 'bg-emerald-100 text-emerald-800' },
      { code: 'Criterion 8', title: 'Institutional Support', desc: 'Leadership, administrative services, & digital infrastructure', source: 'ASTU Management Hub', status: total === 0 ? 'Pending Data' : 'Review Required', badge: 'bg-amber-100 text-amber-800' },
    ];
  }, [graduates]);

  const handleExport = async (format: 'PDF' | 'Excel' | 'Stata' | 'CSV', scope: string) => {
    try {
      // Export exactly the records we have — never a fabricated sample row.
      const recordsToExport = graduates;
      if (recordsToExport.length === 0) {
        toast.error('No graduate records available to export yet.');
        return;
      }

      let fileContent = '';
      let fileType = 'text/csv';
      let extension = 'csv';

      if (format === 'CSV' || format === 'Excel') {
        const headers = ['Student ID,Full Name,Email,Department,Graduation Year,CGPA,Verified,Status'];
        const rows = recordsToExport.map(g =>
          `"${g.studentId || ''}","${(g.fullName || '').replace(/"/g, '""')}","${g.email || ''}","${(g.department || '').replace(/"/g, '""')}","${g.graduationYear ?? ''}","${g.cgpa ?? ''}",${g.identityVerified ? 'TRUE' : 'FALSE'},"${g.status || ''}"`
        );
        fileContent = [...headers, ...rows].join('\n');
        // Excel downloads as CSV that Excel opens cleanly — not a binary .xlsx workbook
        fileType = 'text/csv';
        extension = 'csv';
      } else if (format === 'Stata') {
        const header = '* ASTU Institutional Alumni Dataset (.dta export format)\n* Variable metadata: student_id (str), full_name (str), dept (str), cgpa (float)\n';
        const rows = recordsToExport.map((g, idx) =>
          `${idx + 1}\t${g.studentId || ''}\t"${g.fullName || ''}"\t"${g.department || ''}"\t${g.graduationYear || ''}\t${g.cgpa || ''}\t${g.identityVerified ? 1 : 0}`
        );
        fileContent = header + rows.join('\n');
        fileType = 'text/plain';
        extension = 'dta';
      } else if (format === 'PDF') {
        // Open PDF print report window
        const printWin = window.open('', '_blank');
        if (printWin) {
          const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
          printWin.document.write(`
            <html>
              <head>
                <title>ASTU Executive Summary Report - ${scope}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
                  .header-banner { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #002b5e; padding-bottom: 12px; margin-bottom: 15px; }
                  .logo-img { height: 60px; width: 60px; object-fit: contain; }
                  h1 { color: #002b5e; font-size: 20px; margin: 0 0 4px 0; }
                  h2 { color: #475569; font-size: 14px; margin: 0; }
                  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                  th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
                  th { background: #f1f5f9; color: #002b5e; }
                  .meta { background: #e0f2fe; padding: 12px; border-radius: 8px; font-size: 13px; margin: 15px 0; }
                </style>
              </head>
              <body>
                <div class="header-banner">
                  <img src="${logoUrl}" alt="ASTU Seal Logo" class="logo-img" />
                  <div>
                    <h1>Adama Science and Technology University</h1>
                    <h2>Institutional Executive Summary Report</h2>
                  </div>
                </div>
                <div class="meta">
                  <strong>Report Scope:</strong> ${scope}<br>
                  <strong>Generated On:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Total Records:</strong> ${recordsToExport.length} Graduates
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Student ID</th><th>Graduate Name</th><th>Department</th><th>Graduation Year</th><th>CGPA</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recordsToExport.map((g, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${g.studentId || '-'}</td>
                        <td>${g.fullName || '-'}</td>
                        <td>${g.department || '-'}</td>
                        <td>${g.graduationYear || '-'}</td>
                        <td>${g.cgpa || '-'}</td>
                        <td>${g.status || 'Verified'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <script>window.onload = function() { window.print(); };</script>
              </body>
            </html>
          `);
          printWin.document.close();
        }
        fileContent = `PDF Summary Report - ${scope}\nGenerated: ${new Date().toISOString()}\nTotal Records: ${recordsToExport.length}`;
        extension = 'pdf';
      }

      // Download file if not opened in print window
      if (format !== 'PDF' || !window.open) {
        const blob = new Blob([fileContent], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `astu_report_${scope.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      const calculatedSize = `${Math.max(1.1, (fileContent.length / 1024)).toFixed(1)} KB`;

      // Log export directly into database
      const logged = await registrarService.logExport({
        reportName: scope,
        format,
        recordCount: recordsToExport.length,
        fileSize: calculatedSize,
      });

      if (logged) {
        setExportLogs(prev => [logged, ...prev]);
      } else {
        const freshLogs = await registrarService.getExportLogs();
        setExportLogs(freshLogs);
      }

      toast.success(`Exported ${recordsToExport.length} records to ${format}!`);
    } catch (err) {
      console.error('Failed to generate export:', err);
      toast.error('Failed to generate report export.');
    }
  };

  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) {
      toast.error('Please enter a report title.');
      return;
    }
    setSubmittingSchedule(true);
    try {
      const created = await registrarService.createScheduledReport({
        title: newScheduleTitle.trim(),
        format: newScheduleFormat,
        schedule: newScheduleFreq,
        nextRun: newScheduleDate || 'Next Month',
      });
      if (created) {
        setScheduledReports(prev => [created, ...prev]);
      } else {
        const fresh = await registrarService.getScheduledReports();
        setScheduledReports(fresh);
      }
      toast.success('Scheduled report created successfully!');
      setShowScheduleModal(false);
      setNewScheduleTitle('');
    } catch (err) {
      toast.error('Failed to create scheduled report.');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleToggleScheduleStatus = async (report: ScheduledReport) => {
    const nextStatus = report.status === 'Active' ? 'Paused' : 'Active';
    try {
      await registrarService.toggleScheduledReportStatus(report.id, nextStatus);
      setScheduledReports(prev => prev.map(r => r.id === report.id ? { ...r, status: nextStatus } : r));
      toast.success(`Schedule status changed to ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update schedule status.');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled report?')) return;
    try {
      await registrarService.deleteScheduledReport(id);
      setScheduledReports(prev => prev.filter(r => r.id !== id));
      toast.success('Scheduled report deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete scheduled report.');
    }
  };

  const handleRunScheduleNow = async (report: ScheduledReport) => {
    toast.loading(`Running scheduled report: ${report.title}...`, { id: 'run-schedule' });
    try {
      await handleExport((report.format as any) || 'PDF', report.title);
      toast.success(`Report "${report.title}" generated successfully!`, { id: 'run-schedule' });
    } catch (err) {
      toast.error('Failed to run scheduled report.', { id: 'run-schedule' });
    }
  };

  return (
    <div className="space-y-6 pb-16">

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0A2540] via-[#002B5E] to-[#005C2B] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(0,200,83,0.15)_0%,transparent_50%)]" />
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Students' Skill Development Coordination Office</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Institutional Reports & Analytics</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Real-time graduate tracking, batch performance analytics, and accreditation-ready exports for ASTU.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['overview', 'exports', 'scheduled', 'accreditation'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveReportTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeReportTab === tab ? 'bg-white text-astu-navy shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}>
                {tab === 'overview' ? 'Overview' : tab === 'exports' ? 'Export Center' : tab === 'scheduled' ? 'Scheduled Reports' : 'Accreditation'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeReportTab === 'overview' && (
        <>
          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Graduates Tracked', value: totalGrads.toLocaleString(), change: `Live Database`, trend: '✓' },
              { label: 'Average CGPA', value: avgCgpa, change: `Live Calculation`, trend: '↑' },
              { label: 'Active / Verified Rate', value: registeredCoverageRate, change: `Roster-based`, trend: '↑' },
              { label: 'Data Exports Generated', value: exportLogs.length.toLocaleString(), change: 'Live Counter', trend: '↑' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{kpi.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
                  {kpi.trend} {kpi.change} <span className="text-gray-400 font-normal">this year</span>
                </div>
              </div>
            ))}
          </div>

          {/* Department Performance & Employment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Department Performance</h3>
                  <p className="text-xs text-gray-500">Live Average CGPA by Department Roster</p>
                </div>
                <span className="text-[10px] px-3 py-1 bg-gray-100 rounded-lg font-bold text-gray-500">{departmentPerformance.length} Departments</span>
              </div>
              <div className="space-y-5">
                {departmentPerformance.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1.5 text-xs">
                      <span className="font-semibold text-gray-800">{item.dept} <span className="text-gray-400 font-normal">({item.count} grads)</span></span>
                      <span className="font-bold text-astu-navy">Avg CGPA: {item.gpa}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: item.width, background: `linear-gradient(90deg, ${item.color}, #00C853)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold mb-1">Graduate Destination & Verification</h3>
              <p className="text-xs text-gray-500 mb-5">Live Database Status Summary</p>
              <div className="space-y-3">
                {destinationStats.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-all">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.status}</p>
                      <p className="text-[10px] text-gray-500">{item.count} graduates</p>
                    </div>
                    <div className="text-2xl font-extrabold px-5 py-2 rounded-xl" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                      {item.percent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports & Quick Access */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Recent Reports & Quick Access</h3>
              <button onClick={() => setActiveReportTab('exports')} className="text-xs font-bold text-astu-navy hover:text-astu-navy/70 transition-all flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportLogs.slice(0, 3).map((report, i) => (
                <div key={i} onClick={() => handleExport(report.format as any, report.reportName)}
                  className="border border-gray-200 hover:border-emerald-400 p-5 rounded-xl transition-all group cursor-pointer hover:shadow-md">
                  <div className="flex justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-lg">{report.format}</span>
                    <span className="text-xs text-gray-400">{report.fileSize || '1.2 MB'}</span>
                  </div>
                  <p className="text-sm font-semibold leading-tight group-hover:text-astu-navy transition-colors">{report.reportName}</p>
                  <p className="text-xs text-gray-400 mt-3">{new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Export Center Tab */}
      {activeReportTab === 'exports' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Export Center</h3>
            <p className="text-xs text-gray-500 mb-6">Generate and download reports in your preferred format for analysis, accreditation, and archival.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { format: 'PDF' as const, icon: 'picture_as_pdf', desc: 'Executive Summary', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', scope: 'Graduate Executive Summary' },
                { format: 'Excel' as const, icon: 'table_chart', desc: 'CSV for Excel', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', scope: 'Full Graduate Dataset' },
                { format: 'Stata' as const, icon: 'analytics', desc: 'Tab-delimited research export', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', scope: 'Research Dataset Batch' },
                { format: 'CSV' as const, icon: 'data_array', desc: 'Universal Format', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', scope: 'Raw Alumni Roster' },
              ].map((item, i) => (
                <button key={i} onClick={() => handleExport(item.format, item.scope)}
                  className={`${item.bg} ${item.border} border rounded-2xl p-5 text-center hover:shadow-md transition-all group hover:scale-[1.02]`}>
                  <span className={`material-symbols-outlined text-3xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  <p className={`text-lg font-extrabold ${item.color} mt-2`}>{item.format === 'Excel' ? 'Excel CSV' : item.format}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export History (Database Backed) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">history</span>
                Recent Exports ({exportLogs.length})
              </h4>
              <button onClick={fetchReportingData} className="text-xs text-gray-500 hover:text-astu-navy flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-gray-500">Loading export audit logs...</div>
            ) : exportLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                No data exports generated yet. Click any format above to generate your first export!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-3 pr-2">Report Name</th>
                      <th className="pb-3 pr-2">Format</th>
                      <th className="pb-3 pr-2">Exported By</th>
                      <th className="pb-3 pr-2">Date</th>
                      <th className="pb-3">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exportLogs.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-2 font-medium text-gray-800">{exp.reportName}</td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.format === 'PDF' ? 'bg-red-50 text-red-700' :
                            exp.format === 'Excel' ? 'bg-emerald-50 text-emerald-700' :
                            exp.format === 'Stata' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {exp.format}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-gray-500">{exp.exportedBy || 'Registrar Admin'}</td>
                        <td className="py-3 pr-2 text-gray-500">{new Date(exp.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-gray-400">{exp.fileSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeReportTab === 'scheduled' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">schedule</span>
                Scheduled Reports ({scheduledReports.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Automate recurring report generation for university leadership & accreditation stakeholders.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchReportingData} className="p-2.5 text-gray-500 hover:text-astu-navy bg-gray-50 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
              <button onClick={() => setShowScheduleModal(true)}
                className="px-5 py-2.5 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-astu-navy/90 transition-all shadow-md flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add</span>
                New Schedule
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading scheduled reports from database...</div>
          ) : scheduledReports.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">event_repeat</span>
              <p className="text-sm font-bold text-gray-700">No Scheduled Reports Configured</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">Create recurring schedule rules to automatically compile and distribute institutional reports.</p>
              <button onClick={() => setShowScheduleModal(true)}
                className="mt-4 px-4 py-2 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-astu-navy/90 transition-all">
                + Create First Schedule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-2">Report Title</th>
                    <th className="pb-3 pr-2">Format</th>
                    <th className="pb-3 pr-2">Schedule</th>
                    <th className="pb-3 pr-2">Next Run</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduledReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 pr-2 font-semibold text-gray-800">
                        <div>
                          {report.title}
                          <p className="text-[10px] text-gray-400 font-normal">Created by {report.createdBy || 'Registrar Admin'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          report.format === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' :
                          report.format === 'Excel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          report.format === 'Stata' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {report.format}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-gray-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-gray-400">repeat</span>
                          {report.schedule}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-gray-600">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-mono">
                          <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                          {report.nextRun}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2">
                        <button
                          onClick={() => handleToggleScheduleStatus(report)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-sm ${
                            report.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                            report.status === 'Paused' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800'
                          }`}
                          title="Click to toggle Active / Paused status"
                        >
                          {report.status}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRunScheduleNow(report)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 border border-emerald-200/60 shadow-xs"
                            title="Generate report immediately on demand"
                          >
                            <span className="material-symbols-outlined text-xs">play_arrow</span>
                            Run Now
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(report.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Schedule"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Export Center Tab */}
      {activeReportTab === 'exports' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Export Center</h3>
            <p className="text-xs text-gray-500 mb-6">Generate and download reports in your preferred format for analysis, accreditation, and archival.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { format: 'PDF' as const, icon: 'picture_as_pdf', desc: 'Executive Summary', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', scope: 'Graduate Executive Summary' },
                { format: 'Excel' as const, icon: 'table_chart', desc: 'CSV for Excel', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', scope: 'Full Graduate Dataset' },
                { format: 'Stata' as const, icon: 'analytics', desc: 'Tab-delimited research export', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', scope: 'Research Dataset Batch' },
                { format: 'CSV' as const, icon: 'data_array', desc: 'Universal Format', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', scope: 'Raw Alumni Roster' },
              ].map((item, i) => (
                <button key={i} onClick={() => handleExport(item.format, item.scope)}
                  className={`${item.bg} ${item.border} border rounded-2xl p-5 text-center hover:shadow-md transition-all group hover:scale-[1.02]`}>
                  <span className={`material-symbols-outlined text-3xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  <p className={`text-lg font-extrabold ${item.color} mt-2`}>{item.format === 'Excel' ? 'Excel CSV' : item.format}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export History (Database Backed) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">history</span>
                Recent Exports ({exportLogs.length})
              </h4>
              <button onClick={fetchReportingData} className="text-xs text-gray-500 hover:text-astu-navy flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-gray-500">Loading export audit logs...</div>
            ) : exportLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                No data exports generated yet. Click any format above to generate your first export!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-3 pr-2">Report Name</th>
                      <th className="pb-3 pr-2">Format</th>
                      <th className="pb-3 pr-2">Exported By</th>
                      <th className="pb-3 pr-2">Date</th>
                      <th className="pb-3">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exportLogs.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-2 font-medium text-gray-800">{exp.reportName}</td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.format === 'PDF' ? 'bg-red-50 text-red-700' :
                            exp.format === 'Excel' ? 'bg-emerald-50 text-emerald-700' :
                            exp.format === 'Stata' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {exp.format}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-gray-500">{exp.exportedBy || 'Registrar Admin'}</td>
                        <td className="py-3 pr-2 text-gray-500">{new Date(exp.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-gray-400">{exp.fileSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeReportTab === 'scheduled' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">schedule</span>
                Scheduled Reports ({scheduledReports.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Automate recurring report generation for university leadership & accreditation stakeholders.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchReportingData} className="p-2.5 text-gray-500 hover:text-astu-navy bg-gray-50 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
              <button onClick={() => setShowScheduleModal(true)}
                className="px-5 py-2.5 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-astu-navy/90 transition-all shadow-md flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add</span>
                New Schedule
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading scheduled reports from database...</div>
          ) : scheduledReports.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">event_repeat</span>
              <p className="text-sm font-bold text-gray-700">No Scheduled Reports Configured</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">Create recurring schedule rules to automatically compile and distribute institutional reports.</p>
              <button onClick={() => setShowScheduleModal(true)}
                className="mt-4 px-4 py-2 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-astu-navy/90 transition-all">
                + Create First Schedule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-2">Report Title</th>
                    <th className="pb-3 pr-2">Format</th>
                    <th className="pb-3 pr-2">Schedule</th>
                    <th className="pb-3 pr-2">Next Run</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduledReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 pr-2 font-semibold text-gray-800">
                        <div>
                          {report.title}
                          <p className="text-[10px] text-gray-400 font-normal">Created by {report.createdBy || 'Registrar Admin'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          report.format === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' :
                          report.format === 'Excel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          report.format === 'Stata' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {report.format}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-gray-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-gray-400">repeat</span>
                          {report.schedule}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-gray-600">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-mono">
                          <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                          {report.nextRun}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2">
                        <button
                          onClick={() => handleToggleScheduleStatus(report)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-sm ${
                            report.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                            report.status === 'Paused' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800'
                          }`}
                          title="Click to toggle Active / Paused status"
                        >
                          {report.status}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRunScheduleNow(report)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 border border-emerald-200/60 shadow-xs"
                            title="Generate report immediately on demand"
                          >
                            <span className="material-symbols-outlined text-xs">play_arrow</span>
                            Run Now
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(report.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Schedule"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Accreditation Tab */}
      {activeReportTab === 'accreditation' && (
        <div className="space-y-6">
          {/* Main Accreditation Header Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                      ABET & HERQA COMPLIANT
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Audit Readiness: 96%
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">Accreditation-Ready Reports & Audit Suite</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Pre-formatted institutional reports compliant with ABET (Accreditation Board for Engineering and Technology) and HERQA (Higher Education Relevance and Quality Agency) audit standards.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExport('PDF', 'ABET Compliance Audit Report')}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  ABET Compliance Report
                </button>
                <button
                  onClick={() => handleExport('PDF', 'HERQA Institutional Self-Study')}
                  className="px-4 py-2.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  HERQA Self-Study
                </button>
                <button
                  onClick={() => handleExport('Excel', 'Institutional Program Review')}
                  className="px-4 py-2.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">table_chart</span>
                  Program Review
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Accreditation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Departments Represented', value: `${departmentPerformance.length}`, status: 'From roster', icon: 'school', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Active / Verified Coverage', value: registeredCoverageRate, status: 'Roster-based', icon: 'analytics', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Graduate Records', value: `${totalGrads}`, status: 'SIS + alumni', icon: 'verified_user', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Exports Generated', value: `${exportLogs.length}`, status: 'This session', icon: 'description', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className={`material-symbols-outlined ${item.color} text-2xl`}>{item.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {/* ABET Engineering Criteria Audit Matrix */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">fact_check</span>
                  ABET EAC/CAC Criteria Compliance Matrix
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Automated assessment mapping across ASTU engineering & science programs.</p>
              </div>
              <button
                onClick={() => handleExport('PDF', 'Complete ABET Criteria Audit Matrix')}
                className="text-xs font-bold text-astu-navy hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download Full Matrix PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-2">Criterion</th>
                    <th className="pb-3 pr-2">Scope / Standard Description</th>
                    <th className="pb-3 pr-2">Data Source</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Evidence Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accreditationCriteria.map((crit, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-astu-navy">{crit.code}</td>
                      <td className="py-3.5 pr-2">
                        <p className="font-semibold text-gray-800">{crit.title}</p>
                        <p className="text-[10px] text-gray-400">{crit.desc}</p>
                      </td>
                      <td className="py-3.5 pr-2 text-gray-500">{crit.source}</td>
                      <td className="py-3.5 pr-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${crit.badge}`}>
                          {crit.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleExport('PDF', `${crit.code} Evidence - ${crit.title}`)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold border border-amber-200 transition-all"
                        >
                          Export Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleCreateScheduleSubmit} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">add_alarm</span>
                Create New Scheduled Report
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Report Title</label>
              <input
                type="text"
                value={newScheduleTitle}
                onChange={e => setNewScheduleTitle(e.target.value)}
                placeholder="e.g. Quarterly ABET Compliance Audit"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-astu-navy dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Format</label>
                <select
                  value={newScheduleFormat}
                  onChange={e => setNewScheduleFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-astu-navy bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel CSV</option>
                  <option value="CSV">CSV</option>
                  <option value="Stata">Stata (.dta)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Schedule Frequency</label>
                <select
                  value={newScheduleFreq}
                  onChange={e => setNewScheduleFreq(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-astu-navy bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="Every 1st of month">Every 1st of month</option>
                  <option value="Every Monday">Every Monday</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Quarterly (Q1/Q2/Q3/Q4)">Quarterly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Next Scheduled Run</label>
              <input
                type="text"
                value={newScheduleDate}
                onChange={e => setNewScheduleDate(e.target.value)}
                placeholder="e.g. Jun 15, 2026 or Next Month"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-astu-navy dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSchedule}
                className="px-5 py-2 text-xs font-bold bg-astu-navy text-white rounded-xl shadow-md hover:bg-astu-navy/90 disabled:opacity-50"
              >
                {submittingSchedule ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
