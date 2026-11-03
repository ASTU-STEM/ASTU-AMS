import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Shield,
  Server,
  Newspaper,
  BookOpen,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';

export type HubKey = 'registrar' | 'department' | 'employer' | 'alumni' | 'admin' | 'ict' | 'cms';

export interface InstitutionalHubBridgeProps {
  currentHub: HubKey;
  className?: string;
  compact?: boolean;
}

interface HubDefinition {
  key: HubKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  allowedRoles: string[];
}

const HUBS: HubDefinition[] = [
  {
    key: 'registrar',
    title: 'Registrar Management Hub',
    shortTitle: 'Registrar Hub',
    subtitle: 'SIS Records, Clearance, Document Verifications & Migration',
    path: '/registrar/dashboard',
    icon: GraduationCap,
    accentColor: 'from-[#003580] to-[#005bb5]',
    badge: 'SIS Authority',
    allowedRoles: ['REGISTRAR', 'SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'admin',
    title: 'Executive Admin Directorate',
    shortTitle: 'Executive Admin',
    subtitle: 'Institutional Governance, Strategic KPIs, Audits & Approvals',
    path: '/admin/dashboard',
    icon: Shield,
    accentColor: 'from-slate-800 to-slate-900',
    badge: 'Super Admin',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'ict',
    title: 'ICT Technical Directorate',
    shortTitle: 'ICT Core',
    subtitle: 'Infrastructure Health, Backups, Security Logs & API Gateways',
    path: '/ict/dashboard',
    icon: Server,
    accentColor: 'from-cyan-700 to-blue-800',
    badge: 'System Admin',
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    key: 'cms',
    title: 'Alumni Office & CMS Portal',
    shortTitle: 'Alumni Office',
    subtitle: 'University News, Reunions, Editorial Approvals & Stories',
    path: '/cms/dashboard',
    icon: Newspaper,
    accentColor: 'from-amber-700 to-orange-800',
    badge: 'CMS Relations',
    allowedRoles: ['ALUMNI_OFFICE', 'SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'department',
    title: 'Department Academic Hub',
    shortTitle: 'Department Hub',
    subtitle: 'Curriculum Alignment, Tracer Analytics & Employability KPIs',
    path: '/department/dashboard',
    icon: BookOpen,
    accentColor: 'from-indigo-700 to-purple-800',
    badge: 'Academic Chair',
    allowedRoles: ['DEPARTMENT_HEAD', 'SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'employer',
    title: 'Employer Talent Portal',
    shortTitle: 'Employer Hub',
    subtitle: 'Talent Acquisition, Vacancy Postings & Campus Recruitment',
    path: '/employer/dashboard',
    icon: Briefcase,
    accentColor: 'from-emerald-700 to-teal-800',
    badge: 'Corporate Partner',
    allowedRoles: ['EMPLOYER', 'SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'alumni',
    title: 'Alumni Community Hub',
    shortTitle: 'Alumni Portal',
    subtitle: 'Career Opportunities, Directory, Mentorship & Giving',
    path: '/alumni/dashboard',
    icon: Users,
    accentColor: 'from-blue-700 to-emerald-700',
    badge: 'Graduate Member',
    allowedRoles: ['ALUMNI', 'SUPER_ADMIN', 'ADMIN'],
  },
];

export const InstitutionalHubBridge: React.FC<InstitutionalHubBridgeProps> = ({
  currentHub,
  className = '',
  compact = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const currentUserRole = user?.role || 'GUEST';
  const currentHubDef = HUBS.find((h) => h.key === currentHub) || HUBS[0];

  const handleNavigateToHub = (hub: HubDefinition) => {
    if (hub.key === currentHub) return;
    navigate(hub.path);
  };

  const isRoleAuthorized = (hub: HubDefinition) => {
    return hub.allowedRoles.includes(currentUserRole);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header bar / Ecosystem Status Banner */}
      <div className="px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#003580] text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#003580] dark:text-emerald-400">
                ASTU-AMS Institutional Network
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                7 Hubs Connected
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Cross-Dashboard Management Bridge • Active Hub:{' '}
              <span className="text-[#003580] dark:text-blue-400 font-extrabold">
                {currentHubDef.title}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Role: <strong className="text-slate-700 dark:text-slate-300">{currentUserRole}</strong></span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Collapse Ecosystem</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Switch Dashboard</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Grid of Interconnected Dashboards */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
            Shared institutional workspace. Seamlessly transition between registrar records, department outcomes, corporate employers, alumni community, and technical directorates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
            {HUBS.map((hub) => {
              const Icon = hub.icon;
              const isCurrent = hub.key === currentHub;
              const authorized = isRoleAuthorized(hub);

              return (
                <button
                  key={hub.key}
                  onClick={() => handleNavigateToHub(hub)}
                  disabled={isCurrent}
                  title={
                    isCurrent
                      ? 'Currently viewing this dashboard'
                      : authorized
                      ? `Switch to ${hub.title}`
                      : `Requires ${hub.allowedRoles.join(' or ')} permission`
                  }
                  className={`relative flex flex-col p-3 rounded-xl border text-left transition-all duration-200 ${
                    isCurrent
                      ? 'border-[#003580] dark:border-blue-500 bg-[#003580]/5 dark:bg-blue-950/20 shadow-xs ring-1 ring-[#003580]/30 cursor-default'
                      : authorized
                      ? 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs hover:-translate-y-0.5'
                      : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 opacity-75 hover:opacity-90'
                  }`}
                >
                  {/* Active Indicator Pin */}
                  {isCurrent && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-[#003580] dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950/70 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  )}

                  {!isCurrent && !authorized && (
                    <span className="absolute top-2 right-2 text-slate-400 dark:text-slate-500" title="Restricted role access">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-[#003580] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {hub.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {hub.shortTitle}
                  </span>
                  <span className="text-[10.5px] leading-tight text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {hub.subtitle}
                  </span>

                  {!isCurrent && (
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#003580] dark:text-blue-400">
                      <span>{authorized ? 'Open Hub' : 'View Hub'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionalHubBridge;
