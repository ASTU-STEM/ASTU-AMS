import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Clock,
  HelpCircle,
  ExternalLink,
  Info,
  Lock,
} from 'lucide-react';
import { PortalActorRole } from '../features/admin/services/portalMenuControl.service';
import { usePortalMenuControl } from '../context/PortalMenuControlContext';

interface PageClosedViewProps {
  actor: PortalActorRole;
  pageId: string;
  pageTitle?: string;
  customNotice?: string;
  onBackToDashboard?: () => void;
}

const actorRoleLabels: Record<PortalActorRole, string> = {
  ALUMNI: 'Alumni Portal',
  EMPLOYER: 'Employer Portal',
  REGISTRAR: 'Registrar Portal',
  DEPARTMENT_HEAD: 'Department Portal',
  ADMIN: 'Admin Portal',
};

export const PageClosedView: React.FC<PageClosedViewProps> = ({
  actor,
  pageId,
  pageTitle,
  customNotice,
  onBackToDashboard,
}) => {
  const navigate = useNavigate();
  const { getMenuItem, getClosedNotice } = usePortalMenuControl();

  const menuItem = getMenuItem(actor, pageId);
  const displayTitle = pageTitle || menuItem?.label || pageId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const effectiveNotice = customNotice || getClosedNotice(actor, pageId) || menuItem?.closedNotice;
  const portalName = actorRoleLabels[actor] || 'Portal';

  const handleReturn = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      // Default dashboard navigation fallback based on actor
      switch (actor) {
        case 'ALUMNI':
          navigate('/alumni/dashboard');
          break;
        case 'EMPLOYER':
          navigate('/employer/dashboard');
          break;
        case 'REGISTRAR':
          navigate('/registrar/dashboard');
          break;
        case 'DEPARTMENT_HEAD':
          navigate('/department/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl shadow-xl overflow-hidden transition-all">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full">
                  Access Suspended
                </span>
                <span className="text-xs text-amber-100 font-medium">{portalName}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                {displayTitle} is Temporarily Closed
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100">Authority</span>
            <span className="text-xs font-semibold text-white">Alumni Office</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Official Notice Callout */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Official Administrative Notice
                </h2>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  {effectiveNotice || (
                    <>
                      This page has been temporarily deactivated by the{' '}
                      <strong>Directorate of Alumni Relations & Affairs Office</strong>. Access to this service is
                      currently paused for system maintenance, cycle review, or institutional scheduling.
                    </>
                  )}
                </p>
                {menuItem?.closedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700/80 dark:text-amber-400/80 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Closed on: {new Date(menuItem.closedAt).toLocaleDateString()} at {new Date(menuItem.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Building className="w-3.5 h-3.5 text-[#003580] dark:text-sky-400" />
                <span>Supervisory Office</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                ASTU Alumni Relations & Career Affairs Directorate
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Main Administration Building, Room 204
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Status & Impact</span>
              </div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Offline / Data Viewing Suspended
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Page contents will resume displaying immediately once reopened by the Alumni Officer.
              </p>
            </div>
          </div>

          {/* Contact Support Assistance */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Need urgent access? Email:</span>
                <a
                  href="mailto:alumnioffice@astu.edu.et"
                  className="font-bold text-[#003580] dark:text-sky-400 hover:underline"
                >
                  alumnioffice@astu.edu.et
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Direct Hotline: +251 22 110 0001 (Ext. 204)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReturn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#003580] hover:bg-[#002866] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageClosedView;
