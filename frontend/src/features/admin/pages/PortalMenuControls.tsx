import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Shield,
  Sparkles,
  Eye,
  Info,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  Save,
  MessageSquare,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Clock,
  X,
  ExternalLink,
  LayoutGrid,
  List,
  Pencil,
  Tag,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ControlledMenuItem,
  PortalActorRole,
} from '../services/portalMenuControl.service';
import { usePortalMenuControl } from '../../../context/PortalMenuControlContext';
import PageClosedView from '../../../components/PageClosedView';
import AdminModal from '../components/AdminModal';

const CLOSURE_REASON_PRESETS = [
  'Scheduled system maintenance and platform updates in progress.',
  'Access is temporarily paused for semester-end graduation and records audit.',
  'Service under administrative review by the ASTU Alumni Relations Directorate.',
  'Tracer survey submission has concluded for the active academic cycle.',
  'Temporarily suspended awaiting Senate credential review and approval.',
];

export const PortalMenuControls: React.FC = () => {
  const { user } = useAuth();
  const {
    controls,
    loading,
    saveControls,
    resetControls,
    refreshControls,
  } = usePortalMenuControl();

  const [localItems, setLocalItems] = useState<ControlledMenuItem[]>(controls);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedActor, setSelectedActor] = useState<'ALL' | PortalActorRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal for editing custom closed message
  const [editingItem, setEditingItem] = useState<ControlledMenuItem | null>(null);
  const [noticeInput, setNoticeInput] = useState('');

  // Modal when toggling an item from Open to Closed to prompt for the closure reason
  const [closingItem, setClosingItem] = useState<ControlledMenuItem | null>(null);

  // Modal for previewing how the closed page appears to users
  const [previewItem, setPreviewItem] = useState<ControlledMenuItem | null>(null);

  // Sync when controls change from server/context
  React.useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalItems(controls);
    }
  }, [controls, hasUnsavedChanges]);

  // Statistics
  const stats = useMemo(() => {
    const total = localItems.length;
    const open = localItems.filter((i) => i.enabled).length;
    const closed = total - open;
    const alumniClosed = localItems.filter((i) => i.actor === 'ALUMNI' && !i.enabled).length;
    const employerClosed = localItems.filter((i) => i.actor === 'EMPLOYER' && !i.enabled).length;
    const registrarClosed = localItems.filter((i) => i.actor === 'REGISTRAR' && !i.enabled).length;
    const deptClosed = localItems.filter((i) => i.actor === 'DEPARTMENT_HEAD' && !i.enabled).length;
    const adminClosed = localItems.filter((i) => i.actor === 'ADMIN' && !i.enabled).length;

    return { total, open, closed, alumniClosed, employerClosed, registrarClosed, deptClosed, adminClosed };
  }, [localItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      if (selectedActor !== 'ALL' && item.actor !== selectedActor) return false;
      if (statusFilter === 'OPEN' && !item.enabled) return false;
      if (statusFilter === 'CLOSED' && item.enabled) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLabel = item.label.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesActor = item.actorLabel.toLowerCase().includes(q);
        const matchesNotice = (item.closedNotice || '').toLowerCase().includes(q);
        if (!matchesLabel && !matchesDesc && !matchesCategory && !matchesActor && !matchesNotice) return false;
      }
      return true;
    });
  }, [localItems, selectedActor, statusFilter, searchQuery]);

  // Toggle single item: if turning OFF, open prompt for reason; if turning ON, open directly
  const handleToggle = (key: string) => {
    const targetItem = localItems.find((i) => i.key === key);
    if (!targetItem) return;

    if (targetItem.enabled) {
      // Prompt officer to enter or confirm closure reason
      setClosingItem(targetItem);
      setNoticeInput(targetItem.closedNotice || CLOSURE_REASON_PRESETS[0]);
    } else {
      // Re-enable page directly
      setLocalItems((prev) =>
        prev.map((item) =>
          item.key === key
            ? {
                ...item,
                enabled: true,
                closedAt: null,
                closedBy: null,
              }
            : item
        )
      );
      setHasUnsavedChanges(true);
      toast.success(`"${targetItem.label}" reopened & active! Remember to save changes.`);
    }
  };

  // Confirm closure with entered reason
  const handleConfirmClose = () => {
    if (!closingItem) return;
    const finalNotice = noticeInput.trim();
    setLocalItems((prev) =>
      prev.map((item) =>
        item.key === closingItem.key
          ? {
              ...item,
              enabled: false,
              closedNotice: finalNotice || undefined,
              closedAt: new Date().toISOString(),
              closedBy: user?.email || user?.firstName || 'Alumni Office Officer',
            }
          : item
      )
    );
    setHasUnsavedChanges(true);
    setClosingItem(null);
    toast.success(`"${closingItem.label}" closed with specified reason. Remember to save changes.`);
  };

  // Open edit notice modal
  const handleOpenNoticeModal = (item: ControlledMenuItem) => {
    setEditingItem(item);
    setNoticeInput(item.closedNotice || '');
  };

  const handleSaveNoticeModal = () => {
    if (!editingItem) return;
    setLocalItems((prev) =>
      prev.map((item) => {
        if (item.key === editingItem.key) {
          return {
            ...item,
            closedNotice: noticeInput.trim() || undefined,
          };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    setEditingItem(null);
    toast.success(`Closure notice updated for "${editingItem.label}". Remember to save changes.`);
  };

  // Quick batch actions
  const handleEnableAllCurrent = () => {
    setLocalItems((prev) =>
      prev.map((item) => {
        if (selectedActor === 'ALL' || item.actor === selectedActor) {
          return { ...item, enabled: true, closedAt: null, closedBy: null };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    toast.success(
      selectedActor === 'ALL'
        ? 'All portal pages set to Active / Open!'
        : `All pages for ${selectedActor} set to Active / Open!`
    );
  };

  const handleDisableAllCurrent = () => {
    const actorLabel = selectedActor === 'ALL' ? 'all portals' : selectedActor;
    if (
      !window.confirm(
        `Are you sure you want to close all matching pages for ${actorLabel}? Users will see the closed notice.`
      )
    ) {
      return;
    }

    setLocalItems((prev) =>
      prev.map((item) => {
        if (selectedActor === 'ALL' || item.actor === selectedActor) {
          return {
            ...item,
            enabled: false,
            closedAt: new Date().toISOString(),
            closedBy: user?.email || user?.firstName || 'Alumni Office Officer',
          };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    toast.success(`Pages closed for ${actorLabel}. Remember to click Save Changes.`);
  };

  // Save changes to backend database
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await saveControls(localItems);
      setHasUnsavedChanges(false);
      toast.success('All portal menu controls successfully saved and published!');
    } catch (err: any) {
      toast.error('Failed to save controls: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefaults = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset all portal menu controls to defaults? All pages across all actors will be re-enabled.'
      )
    ) {
      return;
    }
    setIsSaving(true);
    try {
      await resetControls();
      setHasUnsavedChanges(false);
      toast.success('Portal menu controls restored to default state.');
    } catch (err: any) {
      toast.error('Reset failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const getActorBadgeColor = (actor: PortalActorRole) => {
    switch (actor) {
      case 'ALUMNI':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
      case 'EMPLOYER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
      case 'REGISTRAR':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
      case 'DEPARTMENT_HEAD':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900';
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003580] via-[#004899] to-[#1D9E75] p-7 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD700]/15 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Executive Portal Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Portal Page & Sidebar Menu Control
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/90">
              Govern accessibility for sidebar menu pages across all system actor dashboards
              (<strong>Alumni</strong>, <strong>Employer</strong>, <strong>Registrar</strong>,{' '}
              <strong>Department Head</strong>, and <strong>System Administrator</strong>). When an officer marks a page closed, a <strong>"Closed"</strong> badge displays in that actor's sidebar, and opening the page presents the customized reason notice you configure below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg transition-all transform active:scale-95 animate-pulse cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Pending Changes'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              title="Reset all menu controls to active state"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metric KPI Counters ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Managed Pages</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] font-bold text-slate-400">5 Portals</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active / Live Pages</span>
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.open}</span>
            <span className="text-[11px] font-bold text-emerald-600/70">
              {Math.round((stats.open / (stats.total || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-200/80 dark:border-rose-900/40 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Closed Pages</span>
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.closed}</span>
            <span className="text-[11px] font-bold text-rose-600/70">
              {Math.round((stats.closed / (stats.total || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Breakdown Closed</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
            <span>Alumni: <strong>{stats.alumniClosed}</strong></span>
            <span>Emp: <strong>{stats.employerClosed}</strong></span>
            <span>Reg: <strong>{stats.registrarClosed}</strong></span>
            <span>Dept: <strong>{stats.deptClosed}</strong></span>
            <span>Adm: <strong>{stats.adminClosed}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── Actor Filter Tabs + View Mode + Search Toolbar ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Actor Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'ALL', label: 'All Portals', count: localItems.length },
            { id: 'ALUMNI', label: 'Alumni Portal', icon: GraduationCap, count: localItems.filter((i) => i.actor === 'ALUMNI').length },
            { id: 'EMPLOYER', label: 'Employer Portal', icon: Briefcase, count: localItems.filter((i) => i.actor === 'EMPLOYER').length },
            { id: 'REGISTRAR', label: 'Registrar Portal', icon: Building, count: localItems.filter((i) => i.actor === 'REGISTRAR').length },
            { id: 'DEPARTMENT_HEAD', label: 'Department Portal', icon: Layers, count: localItems.filter((i) => i.actor === 'DEPARTMENT_HEAD').length },
            { id: 'ADMIN', label: 'Admin Portal', icon: Shield, count: localItems.filter((i) => i.actor === 'ADMIN').length },
          ].map((tab) => {
            const isSelected = selectedActor === tab.id;
            const Icon = (tab as any).icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedActor(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, View Mode Switcher, Status Filter & Batch Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu pages, keywords, reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003580]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'OPEN'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                Open ({localItems.filter((i) => i.enabled && (selectedActor === 'ALL' || i.actor === selectedActor)).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CLOSED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'CLOSED'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                Closed ({localItems.filter((i) => !i.enabled && (selectedActor === 'ALL' || i.actor === selectedActor)).length})
              </button>
            </div>

            {/* Grid vs Table View Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid layout view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List table view"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <button
              type="button"
              onClick={handleEnableAllCurrent}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
            >
              Open All Current
            </button>
            <button
              type="button"
              onClick={handleDisableAllCurrent}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
            >
              Close All Current
            </button>
          </div>
        </div>
      </div>


      {/* ─── Unsaved Changes Warning Banner ─── */}
      {hasUnsavedChanges && (
        <div className="sticky top-2 z-30 bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                You have unsaved portal menu configuration changes!
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Click "Save Changes" to publish your menu state and closure reasons across all active actor dashboards.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            {isSaving ? 'Saving...' : 'Save Changes Now'}
          </button>
        </div>
      )}

      {/* ─── View 1: Card Grid View ─── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isEnabled = item.enabled;
            return (
              <div
                key={item.key}
                className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
                  isEnabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#003580]/40 hover:shadow-md'
                    : 'bg-rose-50/35 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs ring-1 ring-rose-500/15'
                }`}
              >
                <div>
                  {/* Card Top: Actor Badge & Status Toggle */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getActorBadgeColor(
                        item.actor
                      )}`}
                    >
                      {item.actorLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold ${
                          isEnabled
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isEnabled ? 'ACTIVE / OPEN' : 'CLOSED'}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(item.key)}
                        aria-label={`Toggle ${item.label}`}
                        title={isEnabled ? 'Click to close this page and set reason' : 'Click to re-open page'}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Page Label & Category */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#003580] dark:text-sky-400">
                        {item.icon}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.label}
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      {item.category} • ID: <code className="lowercase">{item.id}</code>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Closure Reason Section */}
                  {!isEnabled ? (
                    <div className="mt-3.5 p-3 rounded-xl bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 text-rose-700 dark:text-rose-300">
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>Closure Reason:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenNoticeModal(item)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 hover:text-rose-900 dark:text-rose-300 underline cursor-pointer"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                          <span>Edit Reason</span>
                        </button>
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-200 font-medium italic leading-relaxed line-clamp-3">
                        "{item.closedNotice || 'Default Alumni Office closure notice applies.'}"
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-500 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live in {item.actorLabel} sidebar
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenNoticeModal(item)}
                        className="text-[10px] font-semibold text-slate-500 hover:text-[#003580] dark:hover:text-sky-300 cursor-pointer"
                      >
                        Pre-set Reason
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#003580] dark:text-slate-400 dark:hover:text-sky-400 font-semibold cursor-pointer"
                    title="Preview what users see when accessing this page"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenNoticeModal(item)}
                    className="inline-flex items-center gap-1.5 text-[#003580] dark:text-sky-400 hover:underline font-semibold cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Change Reason</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── View 2: Compact Table / List View ─── */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3 px-4">Portal Actor</th>
                  <th className="py-3 px-4">Menu Page</th>
                  <th className="py-3 px-4">Category / Route</th>
                  <th className="py-3 px-4 text-center">Sidebar Status</th>
                  <th className="py-3 px-4">Closure Message Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const isEnabled = item.enabled;
                  return (
                    <tr
                      key={item.key}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        !isEnabled ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Actor Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getActorBadgeColor(
                            item.actor
                          )}`}
                        >
                          {item.actorLabel}
                        </span>
                      </td>

                      {/* Menu Page */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[20px] shrink-0 text-[#003580] dark:text-sky-400">
                            {item.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{item.label}</p>
                            <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.category}</span>
                        <p className="text-[10px] font-mono text-slate-400">id: {item.id}</p>
                      </td>

                      {/* Status & Switch */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(item.key)}
                            aria-label={`Toggle ${item.label}`}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isEnabled ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </td>

                      {/* Closure Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {!isEnabled ? (
                          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200">
                            <span className="text-[11px] italic truncate font-medium">
                              "{item.closedNotice || 'Default closure notice applies.'}"
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenNoticeModal(item)}
                              className="text-rose-600 hover:text-rose-800 shrink-0 p-1"
                              title="Edit closure reason"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {item.closedNotice ? `Pre-configured: "${item.closedNotice}"` : 'Active / Default notice'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#003580] hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Preview closed view"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenNoticeModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Change custom closure reason"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">No portal menu pages matched</h2>
          <p className="text-xs text-slate-500">Try adjusting your actor filter or search query.</p>
        </div>
      )}

      {/* ─── Modal 1: Prompt for Closure Reason when Officer Toggles OFF ─── */}
      <AdminModal
        open={Boolean(closingItem)}
        onClose={() => setClosingItem(null)}
        title={`Close Page: ${closingItem?.label || ''}`}
        subtitle={`${closingItem?.actorLabel || ''} Portal • Specify official closure reason`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setClosingItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel / Keep Active
            </button>
            <button
              type="button"
              onClick={handleConfirmClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Confirm & Close Page</span>
            </button>
          </div>
        }
      >
        {closingItem && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Please enter the <strong>reason for closure</strong> that will be displayed to {closingItem.actorLabel} users when they attempt to visit this page. You can choose a quick preset or customize your own:
            </p>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Reason Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLOSURE_REASON_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoticeInput(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-left transition-all cursor-pointer"
                  >
                    • {preset.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Closure Notice Message:
              </label>
              <textarea
                rows={3}
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                placeholder="Enter the official reason for closing this service..."
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003580]"
              />
            </div>
          </div>
        )}
      </AdminModal>

      {/* ─── Modal 2: Edit Custom Closed Notice ─── */}
      <AdminModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Closure Reason: ${editingItem?.label || ''}`}
        subtitle={`${editingItem?.actorLabel || ''} Portal • Update announcement message`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNoticeModal}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#003580] hover:bg-[#002866] text-white shadow-sm cursor-pointer transition-colors"
            >
              Save Reason
            </button>
          </div>
        }
      >
        {editingItem && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Update the official reason for closing this page. Users attempting to access it will see this statement.
            </p>

            {/* Quick Reason Presets */}
            <div>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Reason Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLOSURE_REASON_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoticeInput(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-left transition-all cursor-pointer"
                  >
                    • {preset.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Notice Text / Announcement:
              </label>
              <textarea
                rows={4}
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                placeholder="e.g. Tracer survey submission has closed for the 2024 academic cycle. Please contact the Alumni Relations Office for late registration inquiries."
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003580]"
              />
            </div>
          </div>
        )}
      </AdminModal>

      {/* ─── Modal 3: Preview Page Closed View ─── */}
      <AdminModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title={`Preview: ${previewItem?.label || ''}`}
        subtitle={`Live view of what ${previewItem?.actorLabel || ''} users see when this page is closed`}
        size="lg"
        footer={
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
            >
              Close Preview
            </button>
          </div>
        }
      >
        {previewItem && (
          <div className="py-2">
            <PageClosedView
              actor={previewItem.actor}
              pageId={previewItem.id}
              pageTitle={previewItem.label}
              customNotice={previewItem.closedNotice}
              onBackToDashboard={() => setPreviewItem(null)}
            />
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default PortalMenuControls;
