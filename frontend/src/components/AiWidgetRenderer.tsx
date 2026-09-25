import React, { useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Users,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  Award,
  Layers,
  Clock,
  Send,
  Building2,
  UserCheck,
  Zap,
  TrendingUp,
  Server,
  PieChart as PieIcon,
  Activity,
  Cpu,
  Compass,
  Table as TableIcon
} from 'lucide-react';

import { AiWorkflowStudio } from './AiWorkflowStudio';

export interface AiWidgetRendererProps {
  widget?: string;
  widgetData?: any;
  messageText?: string;
}

// Interactive HTML5 Canvas Sub-Component for Swarm Node Telemetry
const AiCanvasAnalytics: React.FC<{ title?: string }> = ({ title = 'ASTU Realtime Telemetry Canvas' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 450);
    const height = (canvas.height = 190);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; label: string }> = [];
    const colors = ['#008C44', '#E8A020', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];
    const labels = ['CSE-Nodes', 'MoE-Gateway', 'Prisma-DB', 'Telemetry', 'Alumni-Sync', 'Registrar-SLA', 'Safaricom-Feed', 'HERQA-Metric'];

    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        label: labels[i % labels.length],
      });
    }

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Grid background pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Connecting lines between nearby nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = 1 - dist / 100;
            ctx.strokeStyle = `rgba(232, 160, 32, ${alpha * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();

            // Animated data packet pulse along line
            if (frameCount % 60 < 30) {
              const progress = (frameCount % 60) / 30;
              const px = particles[i].x + (particles[j].x - particles[i].x) * progress;
              const py = particles[i].y + (particles[j].y - particles[i].y) * progress;
              ctx.fillStyle = '#00FFCC';
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw particle nodes & labels
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 15 || p.x > width - 15) p.vx *= -1;
        if (p.y < 15 || p.y > height - 15) p.vy *= -1;

        // Glowing outer aura
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Node text label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '8px monospace';
        ctx.fillText(p.label, p.x + 6, p.y + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [title]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-[#090b10] p-2 shadow-inner">
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5 text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#E8A020]">
        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        <span>{title}</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[190px] rounded-lg block" />
    </div>
  );
};

export const AiWidgetRenderer: React.FC<AiWidgetRendererProps> = ({
  widget,
  widgetData,
  messageText = '',
}) => {
  const [activeTab, setActiveTab] = useState<'graphics' | 'radar' | 'canvas' | 'table'>('graphics');

  const txt = (messageText || '').toLowerCase();
  const rawData = widgetData?.data || widgetData;

  // Determine effective widget type
  let effectiveWidget = widget || widgetData?.queryType;

  if (!effectiveWidget) {
    if (txt.includes('workflow') || txt.includes('automation') || txt.includes('action studio') || txt.includes('trigger')) {
      effectiveWidget = 'WORKFLOW_STUDIO';
    } else if (txt.includes('email') && (txt.includes('dispatched') || txt.includes('sent') || txt.includes('notification') || txt.includes('welcome'))) {
      effectiveWidget = 'EMAIL_AND_NOTIFICATION_DISPATCHED';
    } else if (txt.includes('document request') || txt.includes('sla status') || txt.includes('pending sla') || txt.includes('transcript')) {
      effectiveWidget = 'DOCUMENT_SLA_DATABASE';
    } else if (txt.includes('registered account') || txt.includes('account management') || txt.includes('total registered') || txt.includes('audit log')) {
      effectiveWidget = 'USER_AUDIT_DATABASE';
    } else if (txt.includes('profile') && (txt.includes('lookup') || txt.includes('user-') || txt.includes('usr-'))) {
      effectiveWidget = 'ACCOUNT_PROFILE_LOOKUP';
    } else if (txt.includes('moe') || txt.includes('ministry') || txt.includes('strategic indicator')) {
      effectiveWidget = 'MOE_MINISTRY_DATABASE';
    } else if (txt.includes('job') || txt.includes('hiring') || txt.includes('vacancy') || txt.includes('employer')) {
      effectiveWidget = 'JOBS_DATABASE';
    } else if (txt.includes('alumni') || txt.includes('graduate')) {
      effectiveWidget = 'ALUMNI_DATABASE';
    } else if (txt.includes('tracer') || txt.includes('survey') || txt.includes('wave 3')) {
      effectiveWidget = 'SURVEY_TRACER_DATABASE';
    } else if (txt.includes('feedback') || txt.includes('skill gap') || txt.includes('missing skill')) {
      effectiveWidget = 'EMPLOYER_FEEDBACK_DATABASE';
    } else if (txt.includes('action') && txt.includes('execute')) {
      effectiveWidget = 'SYSTEM_ACTION_EXECUTED';
    }
  }

  if (effectiveWidget === 'WORKFLOW_STUDIO') {
    return (
      <div className="mt-2.5">
        <AiWorkflowStudio />
      </div>
    );
  }

  if (effectiveWidget === 'DYNAMIC_AGENT_BUILDER') {
    const ag = rawData || {};
    const name = ag.name || 'Autonomous Dynamic Agent';
    const description = ag.description || 'Specialized AI Agent created to perform custom user requests.';
    const capabilities: string[] = ag.capabilities || ['Custom Execution', 'Database Integration'];
    const createdBy = ag.createdBy || 'SuperAdmin AI System';
    const createdAt = ag.createdAt || new Date().toISOString().split('T')[0];
    const executionCount = ag.executionCount || 1;

    return (
      <div className="mt-2.5 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3.5 shadow-md dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/40 transition-all space-y-2.5">
        <div className="flex items-center justify-between border-b border-blue-200/60 pb-2 dark:border-blue-800/40">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#0a4d8c] text-[#E8A020] shadow-xs">
              <Cpu className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[12px] font-extrabold text-[#003366] dark:text-blue-300">{name}</div>
              <div className="text-[9px] text-slate-400 font-mono">ID: {ag.id || 'agent-dyn'}</div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            ✨ Saved to PostgreSQL DB
          </span>
        </div>

        <p className="text-[10.5px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {capabilities.map((cap, i) => (
            <span key={i} className="rounded-md bg-white/90 px-2 py-0.5 text-[9px] font-bold text-blue-800 dark:bg-slate-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
              ⚡ {cap}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 text-[9.5px] text-slate-500 dark:border-blue-900/40">
          <span>Author: <strong className="text-slate-800 dark:text-slate-200">{createdBy}</strong> ({createdAt})</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">Execution Count: {executionCount} Runs</span>
        </div>
      </div>
    );
  }

  if (!effectiveWidget) return null;

  // Sample Datasets for Rich Recharts Graphics & Radar Analysis
  const trendData = [
    { year: '2021', rate: 42.0, salary: 14200, confidence: 85 },
    { year: '2022', rate: 46.5, salary: 15800, confidence: 88 },
    { year: '2023', rate: 51.0, salary: 17400, confidence: 91 },
    { year: '2024', rate: 55.0, salary: 19185, confidence: 94.5 },
    { year: '2025 (Est)', rate: 61.2, salary: 21500, confidence: 96 },
    { year: '2026 (AI)', rate: 67.8, salary: 24200, confidence: 97.5 },
  ];

  const pieSectorData = [
    { name: 'Computer Science (CSE)', value: 40, color: '#008C44' },
    { name: 'Electrical Eng (ECE)', value: 25, color: '#3b82f6' },
    { name: 'Mechanical Eng (ME)', value: 20, color: '#E8A020' },
    { name: 'Civil Eng (CE)', value: 15, color: '#ec4899' },
  ];

  const radarSkillData = [
    { subject: 'Python / Django', Industry: 92, ASTU_Graduates: 78, FullMark: 100 },
    { subject: 'System Design', Industry: 88, ASTU_Graduates: 84, FullMark: 100 },
    { subject: 'Data Science', Industry: 85, ASTU_Graduates: 72, FullMark: 100 },
    { subject: 'DevOps / Cloud', Industry: 90, ASTU_Graduates: 68, FullMark: 100 },
    { subject: 'SQL / Databases', Industry: 95, ASTU_Graduates: 88, FullMark: 100 },
    { subject: 'Problem Solving', Industry: 96, ASTU_Graduates: 91, FullMark: 100 },
  ];

  const employerBarData = [
    { name: 'Safaricom', hires: 14, salary: 35000 },
    { name: 'Ethio Telecom', hires: 11, salary: 30000 },
    { name: 'Sunshine', hires: 9, salary: 22000 },
    { name: 'INSA', hires: 7, salary: 32000 },
    { name: 'Wabi Tech', hires: 8, salary: 28000 },
  ];

  // Helper Tab Switcher Bar
  const renderTabSwitcher = () => (
    <div className="flex items-center gap-1 border-b border-slate-200/80 pb-2 mb-3 dark:border-slate-800 text-[10px] font-bold">
      <button
        type="button"
        onClick={() => setActiveTab('graphics')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          activeTab === 'graphics'
            ? 'bg-[#003366] text-white shadow-xs dark:bg-[#E8A020] dark:text-slate-900 font-extrabold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <BarChart3 className="h-3 w-3" />
        <span>📊 Visual Graphics</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('radar')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          activeTab === 'radar'
            ? 'bg-[#003366] text-white shadow-xs dark:bg-[#E8A020] dark:text-slate-900 font-extrabold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <Compass className="h-3 w-3" />
        <span>🎯 Skill Radar</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('canvas')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          activeTab === 'canvas'
            ? 'bg-[#003366] text-white shadow-xs dark:bg-[#E8A020] dark:text-slate-900 font-extrabold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <Activity className="h-3 w-3" />
        <span>🎨 Live Canvas</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('table')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          activeTab === 'table'
            ? 'bg-[#003366] text-white shadow-xs dark:bg-[#E8A020] dark:text-slate-900 font-extrabold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <TableIcon className="h-3 w-3" />
        <span>📋 Data Table</span>
      </button>
    </div>
  );

  // 1. EMAIL_AND_NOTIFICATION_DISPATCHED
  if (effectiveWidget === 'EMAIL_AND_NOTIFICATION_DISPATCHED') {
    const info = rawData || {};
    const targetLabel = info.targetLabel || 'All New & Registered System Users (45 Accounts)';
    const targetEmail = info.targetEmail || 'users.all@astu.edu.et';
    const subject = info.subject || 'Official Notice: ASTU Alumni Management System';
    const emailStatus = info.emailStatus || 'Delivered to Recipient(s) via SMTP Gateway';
    const inAppStatus = info.inAppStatus || 'Logged & Broadcast to Database Notification Bell(s)';
    const executedAt = info.executedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="mt-2.5 rounded-xl border border-emerald-200 bg-white p-3.5 shadow-md dark:border-emerald-900/60 dark:bg-[#1a1d27] transition-all">
        {renderTabSwitcher()}

        {activeTab === 'graphics' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Email Broadcast &amp; Notification Telemetry Graph
                </span>
              </div>
              <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                {executedAt}
              </span>
            </div>

            {/* Recharts Bar Delivery Graphic */}
            <div className="h-[140px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'SMTP Delivered', count: 45, fill: '#008C44' }, { name: 'In-App Bell', count: 45, fill: '#3b82f6' }, { name: 'Failed', count: 0, fill: '#ef4444' }]}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">{targetLabel}</div>
                <div className="text-[9px] text-slate-500 font-mono truncate">{targetEmail}</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <div className="font-bold text-blue-900 dark:text-blue-300">{subject}</div>
                <div className="text-[9px] text-emerald-600 font-bold">{emailStatus}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="ASTU Graduates" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.5} />
                <Radar name="Industry Demand" dataKey="Industry" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'canvas' && <AiCanvasAnalytics title="Live Email Broadcast Swarm Canvas" />}

        {activeTab === 'table' && (
          <div className="space-y-2 text-[10.5px]">
            <div className="rounded-lg bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Target Recipients</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{targetLabel} ({targetEmail})</div>
            </div>
            <div className="rounded-lg bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Broadcast Subject</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{subject}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. DOCUMENT_SLA_DATABASE (Registrar Requests & SLA Status with Area & Funnel Graphics)
  if (effectiveWidget === 'DOCUMENT_SLA_DATABASE') {
    const info = rawData || {};
    const totalRequests = info.totalRequests || 45;
    const pendingRequests = info.pendingRequests || 7;
    const approvedRequests = info.approvedRequests || 38;

    const sampleRequests = [
      { id: 'REQ-2025-089', student: 'Abebe Kebede', doc: 'Official Academic Transcript', sla: '24 Hours', status: 'Issued', date: '2025-09-22' },
      { id: 'REQ-2025-090', student: 'Wabi Tena', doc: 'Degree Certificate (Duplicate)', sla: '48 Hours', status: 'Pending SLA', date: '2025-09-23' },
      { id: 'REQ-2025-091', student: 'Tigist Haile', doc: 'English Medium of Instruction', sla: '12 Hours', status: 'Issued', date: '2025-09-23' },
      { id: 'REQ-2025-092', student: 'Dawit Tadesse', doc: 'Letter of Attestation', sla: '24 Hours', status: 'Pending SLA', date: '2025-09-24' },
      { id: 'REQ-2025-093', student: 'Chala Bekele', doc: 'Official Transcript (MoE Copy)', sla: '48 Hours', status: 'Issued', date: '2025-09-24' },
    ];

    return (
      <div className="mt-2.5 rounded-xl border border-emerald-300/80 bg-white p-3.5 shadow-md dark:border-emerald-800/60 dark:bg-[#1a1d27] transition-all">
        {renderTabSwitcher()}

        {activeTab === 'graphics' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#008C44] dark:text-emerald-400" />
                <span className="text-[12px] font-extrabold text-[#003366] dark:text-emerald-300">
                  Registrar Document Requests &amp; SLA Status Graphics
                </span>
              </div>
            </div>

            {/* Total & SLA KPI Bar */}
            <div className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 px-3.5 py-2 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                <span>Total Requests:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">{totalRequests}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[#D97706] dark:text-amber-400">
                <span>Pending SLA:</span>
                <span className="font-extrabold text-xs">{pendingRequests}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[#008C44] dark:text-emerald-400">
                <span>Issued:</span>
                <span className="font-extrabold text-xs">{approvedRequests}</span>
              </div>
            </div>

            {/* Recharts Area Processing Graph */}
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008C44" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#008C44" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="confidence" stroke="#008C44" fillOpacity={1} fill="url(#colorSla)" name="SLA Compliance %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="ASTU Graduates" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.5} />
                <Radar name="Industry Demand" dataKey="Industry" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'canvas' && <AiCanvasAnalytics title="Registrar Document SLA Telemetry Canvas" />}

        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#13161f]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-2.5 py-1.5">Req ID</th>
                  <th className="px-2.5 py-1.5">Student / Alumni</th>
                  <th className="px-2.5 py-1.5">Document Type</th>
                  <th className="px-2.5 py-1.5">SLA Target</th>
                  <th className="px-2.5 py-1.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {sampleRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-2.5 py-1.5 font-mono text-[9.5px] font-bold text-slate-600 dark:text-slate-300">{req.id}</td>
                    <td className="px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100">{req.student}</td>
                    <td className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400">{req.doc}</td>
                    <td className="px-2.5 py-1.5 text-slate-500 dark:text-slate-400">{req.sla}</td>
                    <td className="px-2.5 py-1.5 text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          req.status === 'Issued'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 3. USER_AUDIT_DATABASE & ACCOUNT_MANAGEMENT (with Doughnut Pie Graphics)
  if (effectiveWidget === 'USER_AUDIT_DATABASE' || effectiveWidget === 'ACCOUNT_MANAGEMENT') {
    const info = rawData || {};
    const totalUsers = info.totalUsers || 45;
    const activeUsers = info.activeUsers || 19;
    const pendingUsers = info.pendingUsers || 21;
    const inactiveUsers = info.inactiveUsers || 5;

    const accountPieData = [
      { name: 'Active (19)', value: activeUsers, color: '#008C44' },
      { name: 'Pending (21)', value: pendingUsers, color: '#E8A020' },
      { name: 'Inactive (5)', value: inactiveUsers, color: '#94a3b8' },
    ];

    const auditLogs = [
      { id: 'AUD-8812', action: 'AI Email Dispatch Broadcast', user: 'SuperAdmin System AI', time: 'Just now' },
      { id: 'AUD-8811', action: 'Alumni Profile Verification', user: 'Registrar Office', time: '12m ago' },
      { id: 'AUD-8810', action: 'Password Reset Issued', user: 'Wabi Tena (Alumni)', time: '1h ago' },
      { id: 'AUD-8809', action: 'Transcript Request Approved', user: 'Registrar Staff', time: '3h ago' },
      { id: 'AUD-8808', action: 'Employer Portal Registration', user: 'Safaricom Ethiopia', time: '5h ago' },
    ];

    return (
      <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-md dark:border-slate-800 dark:bg-[#1a1d27] transition-all">
        {renderTabSwitcher()}

        {activeTab === 'graphics' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
              <Users className="h-4 w-4 text-[#003366] dark:text-[#E8A020]" />
              <span className="text-[12px] font-extrabold text-[#003366] dark:text-[#E8A020]">
                ASTU Account Distribution &amp; Status Pie Graphics
              </span>
            </div>

            {/* Doughnut Pie Chart */}
            <div className="h-[160px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={accountPieData} innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                    {accountPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="ASTU Graduates" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.5} />
                <Radar name="Industry Demand" dataKey="Industry" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'canvas' && <AiCanvasAnalytics title="Account Telemetry & Security Matrix Canvas" />}

        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#13161f]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-2.5 py-1.5">Audit ID</th>
                  <th className="px-2.5 py-1.5">Action Executed</th>
                  <th className="px-2.5 py-1.5">Initiator / Role</th>
                  <th className="px-2.5 py-1.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-2.5 py-1.5 font-mono text-[9.5px] font-bold text-slate-500">{log.id}</td>
                    <td className="px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-200">{log.action}</td>
                    <td className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400">{log.user}</td>
                    <td className="px-2.5 py-1.5 text-right text-slate-400">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 4. MOE_MINISTRY_DATABASE & Strategic Indicators
  if (effectiveWidget === 'MOE_MINISTRY_DATABASE' || effectiveWidget === 'MOE_COMPLIANCE') {
    return (
      <div className="mt-2.5 rounded-xl border border-amber-200 bg-white p-3.5 shadow-md dark:border-amber-900/60 dark:bg-[#1a1d27] transition-all">
        {renderTabSwitcher()}

        {activeTab === 'graphics' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2 dark:border-amber-800/40">
              <Award className="h-4 w-4 text-[#E8A020]" />
              <span className="text-[12px] font-extrabold text-[#003366] dark:text-amber-300">
                🇪🇹 MoE Compliance Benchmark vs ASTU Actual (Bar Graph)
              </span>
            </div>

            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'IND-01 Plan', MoE: 10, ASTU: 9.95 }, { name: 'IND-02 HERQA', MoE: 65, ASTU: 69 }, { name: 'IND-03 STEM %', MoE: 50, ASTU: 60 }, { name: 'IND-08 Trust', MoE: 7.0, ASTU: 6.9 }]}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Bar dataKey="MoE" fill="#94a3b8" name="MoE Benchmark" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ASTU" fill="#008C44" name="ASTU Actual" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="ASTU Performance" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.6} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'canvas' && <AiCanvasAnalytics title="MoE Strategic Compliance Swarm Canvas" />}

        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#13161f]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-2.5 py-1.5">Code</th>
                  <th className="px-2.5 py-1.5">Indicator Name</th>
                  <th className="px-2.5 py-1.5">Target</th>
                  <th className="px-2.5 py-1.5 text-right">ASTU Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {[
                  { code: 'IND-01', name: 'Plan Alignment', target: '10.0%', actual: '9.95%' },
                  { code: 'IND-02', name: 'HERQA Impact Score', target: '65.0', actual: '69.0' },
                  { code: 'IND-03', name: 'Female STEM Placement', target: '50.0%', actual: '60.0%' },
                  { code: 'IND-08', name: 'Brand Trust', target: '7.0/10', actual: '6.9/10' },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-2.5 py-1.5 font-mono text-[9.5px] font-bold text-amber-600">{row.code}</td>
                    <td className="px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="px-2.5 py-1.5 text-slate-500">{row.target}</td>
                    <td className="px-2.5 py-1.5 text-right font-bold text-emerald-600">{row.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 5. JOBS_DATABASE & Industry Hiring Graphics
  if (effectiveWidget === 'JOBS_DATABASE' || effectiveWidget === 'APPLICATIONS_DATABASE') {
    return (
      <div className="mt-2.5 rounded-xl border border-blue-200 bg-white p-3.5 shadow-md dark:border-blue-900/60 dark:bg-[#1a1d27] transition-all">
        {renderTabSwitcher()}

        {activeTab === 'graphics' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2 dark:border-blue-900/40">
              <Briefcase className="h-4 w-4 text-[#003366] dark:text-[#E8A020]" />
              <span className="text-[12px] font-extrabold text-[#003366] dark:text-[#E8A020]">
                Top Hiring Partner Employers &amp; Salary Offers (ETB)
              </span>
            </div>

            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employerBarData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Bar dataKey="salary" fill="#3b82f6" name="Avg Starting Salary (ETB)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="ASTU Graduates" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.5} />
                <Radar name="Industry Demand" dataKey="Industry" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'canvas' && <AiCanvasAnalytics title="Industry Employer Job Swarm Canvas" />}

        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#13161f]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-2.5 py-1.5">Employer</th>
                  <th className="px-2.5 py-1.5">Placement Count</th>
                  <th className="px-2.5 py-1.5 text-right">Starting Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {employerBarData.map((emp) => (
                  <tr key={emp.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100">{emp.name}</td>
                    <td className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400">{emp.hires} Alumni</td>
                    <td className="px-2.5 py-1.5 text-right font-bold text-emerald-600">ETB {emp.salary.toLocaleString()}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 6. Default / Tracer Survey Visual Graphics
  return (
    <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-md dark:border-slate-800 dark:bg-[#1a1d27] transition-all">
      {renderTabSwitcher()}

      {activeTab === 'graphics' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#E8A020]" />
              <span className="text-[11px] font-extrabold text-[#003366] dark:text-[#E8A020]">
                ASTU Employment Growth Trend (2021 - 2026 AI Projection)
              </span>
            </div>
          </div>

          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Area type="monotone" dataKey="rate" stroke="#E8A020" fillOpacity={1} fill="url(#colorTrend)" name="Employment Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'radar' && (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarSkillData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
              <Radar name="ASTU Graduates" dataKey="ASTU_Graduates" stroke="#008C44" fill="#008C44" fillOpacity={0.5} />
              <Radar name="Industry Demand" dataKey="Industry" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'canvas' && <AiCanvasAnalytics title="ASTU Swarm Neural Telemetry Canvas" />}

      {activeTab === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#13161f]">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-2.5 py-1.5">Department</th>
                <th className="px-2.5 py-1.5">Employment %</th>
                <th className="px-2.5 py-1.5 text-right">Avg Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {[
                { dept: 'Computer Science (CSE)', pct: '87.2%', sal: 'ETB 23,400/mo' },
                { dept: 'Electrical Engineering (ECE)', pct: '79.5%', sal: 'ETB 22,000/mo' },
                { dept: 'Mechanical Engineering (ME)', pct: '72.1%', sal: 'ETB 18,000/mo' },
                { dept: 'Civil Engineering (CE)', pct: '64.8%', sal: 'ETB 19,500/mo' },
              ].map((row) => (
                <tr key={row.dept} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100">{row.dept}</td>
                  <td className="px-2.5 py-1.5 text-emerald-600 font-bold">{row.pct}</td>
                  <td className="px-2.5 py-1.5 text-right font-bold text-slate-800 dark:text-slate-200">{row.sal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
