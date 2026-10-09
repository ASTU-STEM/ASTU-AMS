import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  Type,
  Layout,
  Building2,
  HelpCircle,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  ChevronRight,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DetailPageItem, DetailPageSection, DetailPageStat, DetailPageFaq } from '../services/detailPages.data';
import homepageCmsService, { HomepageCmsConfig, Partner } from '../services/homepageCms.service';

interface PartnerDetailLiveCustomizerProps {
  slug: string;
  pageData: DetailPageItem;
  cmsConfig: HomepageCmsConfig | null;
  partnersList: Partner[];
  onPageChange: (updatedPage: DetailPageItem) => void;
  onPartnersChange: (updatedPartners: Partner[]) => void;
  onClose: () => void;
}

export default function PartnerDetailLiveCustomizer({
  slug,
  pageData,
  cmsConfig,
  partnersList,
  onPageChange,
  onPartnersChange,
  onClose,
}: PartnerDetailLiveCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'companies' | 'stats' | 'faqs' | 'cta'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick edit modal for a company inside customizer
  const [editingCompany, setEditingCompany] = useState<Partner | null>(null);

  const updatePage = (partial: Partial<DetailPageItem>) => {
    setHasChanges(true);
    const updated = { ...pageData, ...partial };
    onPageChange(updated);
  };

  const handleUpdateSection = (index: number, partial: Partial<DetailPageSection>) => {
    setHasChanges(true);
    const updatedSections = [...pageData.sections];
    updatedSections[index] = { ...updatedSections[index], ...partial };
    updatePage({ sections: updatedSections });
  };

  const handleAddSection = () => {
    setHasChanges(true);
    const newSec: DetailPageSection = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      heading: 'New Strategic Initiative',
      body: 'Detailed description regarding this corporate collaboration track or institutional objective.',
      badge: 'Active Track',
      active: true,
    };
    updatePage({ sections: [...pageData.sections, newSec] });
    toast.success('New section card added!');
  };

  const handleDeleteSection = (index: number) => {
    setHasChanges(true);
    const updatedSections = pageData.sections.filter((_, i) => i !== index);
    updatePage({ sections: updatedSections });
    toast.success('Section removed.');
  };

  const handleUpdateStat = (index: number, partial: Partial<DetailPageStat>) => {
    setHasChanges(true);
    const currentStats = pageData.stats || [];
    const updatedStats = [...currentStats];
    updatedStats[index] = { ...updatedStats[index], ...partial };
    updatePage({ stats: updatedStats });
  };

  const handleAddStat = () => {
    setHasChanges(true);
    const currentStats = pageData.stats || [];
    const newStat: DetailPageStat = {
      id: `STAT-${Date.now().toString().slice(-4)}`,
      label: 'New Metric',
      value: '100+',
      desc: 'Annual achievement',
    };
    updatePage({ stats: [...currentStats, newStat] });
  };

  const handleDeleteStat = (index: number) => {
    setHasChanges(true);
    const currentStats = pageData.stats || [];
    updatePage({ stats: currentStats.filter((_, i) => i !== index) });
  };

  const handleUpdateFaq = (index: number, partial: Partial<DetailPageFaq>) => {
    setHasChanges(true);
    const currentFaqs = pageData.faqs || [];
    const updatedFaqs = [...currentFaqs];
    updatedFaqs[index] = { ...updatedFaqs[index], ...partial };
    updatePage({ faqs: updatedFaqs });
  };

  const handleAddFaq = () => {
    setHasChanges(true);
    const currentFaqs = pageData.faqs || [];
    const newFaq: DetailPageFaq = {
      id: `FAQ-${Date.now().toString().slice(-4)}`,
      question: 'Frequently Asked Question topic?',
      answer: 'Clear, concise guidance provided by the ASTU Directorate.',
    };
    updatePage({ faqs: [...currentFaqs, newFaq] });
  };

  const handleDeleteFaq = (index: number) => {
    setHasChanges(true);
    const currentFaqs = pageData.faqs || [];
    updatePage({ faqs: currentFaqs.filter((_, i) => i !== index) });
  };

  const handleTogglePartner = (id: string) => {
    setHasChanges(true);
    const updated = partnersList.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    onPartnersChange(updated);
  };

  const handleTogglePartnerFeatured = (id: string) => {
    setHasChanges(true);
    const updated = partnersList.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
    onPartnersChange(updated);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const currentConfig = homepageCmsService.getSettings() || ({} as any);
      const detailPages = currentConfig.detailPages ? { ...currentConfig.detailPages } : {};
      detailPages[slug] = pageData;

      const payload: HomepageCmsConfig = {
        ...currentConfig,
        detailPages,
        partners: partnersList,
      };

      await homepageCmsService.saveSettings(payload);
      setHasChanges(false);
      toast.success(`Published live: "${pageData.title}" updated!`);
    } catch {
      toast.error('Failed to save to remote database. Cached locally.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 flex h-full flex-col bg-white text-slate-800 shadow-2xl transition-all duration-300 dark:bg-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 ${
        isExpanded ? 'w-full sm:w-[580px] lg:w-[680px]' : 'w-full sm:w-[460px]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366] text-amber-300 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-tight uppercase text-[#003366] dark:text-sky-400">
                Live CMS Customizer
              </h2>
              {hasChanges && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                  Unsaved *
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
              Editing: <span className="font-semibold text-slate-700 dark:text-slate-200">{pageData.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse width' : 'Expand width'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Preview Synchronized</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
              hasChanges
                ? 'bg-red-600 hover:bg-red-500 ring-2 ring-red-400/40 shadow-red-500/20'
                : 'bg-[#003366] hover:bg-[#002244]'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : hasChanges ? 'Save Changes *' : 'Published'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/60 px-4 py-1.5 scrollbar-none dark:border-slate-800 dark:bg-slate-800/40 gap-1">
        {[
          { id: 'hero', label: 'Hero & Title', icon: Type },
          { id: 'stats', label: `Stats (${pageData.stats?.length || 0})`, icon: Sliders },
          { id: 'sections', label: `Sections (${pageData.sections.length})`, icon: Layout },
          { id: 'companies', label: `Employers (${partnersList.length})`, icon: Building2 },
          { id: 'faqs', label: `FAQs (${pageData.faqs?.length || 0})`, icon: HelpCircle },
          { id: 'cta', label: 'CTAs & Links', icon: LinkIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#003366] shadow-xs dark:bg-slate-800 dark:text-sky-300 ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body / Active Tab Editor */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {/* 1. HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Header Badge</label>
              <input
                type="text"
                value={pageData.badge || ''}
                onChange={(e) => updatePage({ badge: e.target.value })}
                placeholder="e.g. Verified Corporate Alliances"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Headline Title *</label>
              <input
                type="text"
                value={pageData.title}
                onChange={(e) => updatePage({ title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle & Rationale *</label>
              <textarea
                rows={3}
                value={pageData.subtitle}
                onChange={(e) => updatePage({ subtitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Background Image URL</label>
              <input
                type="text"
                value={pageData.image}
                onChange={(e) => updatePage({ image: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 font-mono text-[11px]"
              />
              {pageData.image && (
                <div className="mt-2 h-28 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <img src={pageData.image} alt="Hero Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Key Performance Counters</span>
              <button
                type="button"
                onClick={handleAddStat}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500"
              >
                <Plus className="h-3 w-3" />
                <span>Add Metric</span>
              </button>
            </div>

            {(pageData.stats || []).map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Counter #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteStat(idx)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                    title="Remove Counter"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Metric Value</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleUpdateStat(idx, { value: e.target.value })}
                      placeholder="e.g. 500+"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-black text-[#003366] dark:border-slate-600 dark:bg-slate-900 dark:text-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Label Title</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleUpdateStat(idx, { label: e.target.value })}
                      placeholder="e.g. Partner Companies"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-medium dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Brief Subtext</label>
                  <input
                    type="text"
                    value={stat.desc || ''}
                    onChange={(e) => handleUpdateStat(idx, { desc: e.target.value })}
                    placeholder="e.g. Active recruiters on AMS"
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. SECTIONS TAB */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Institutional Content Cards</span>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1 rounded-lg bg-[#003366] px-2.5 py-1 text-xs font-bold text-white hover:brightness-110"
              >
                <Plus className="h-3 w-3" />
                <span>Add Section</span>
              </button>
            </div>

            {pageData.sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#003366] text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.badge || ''}
                      onChange={(e) => handleUpdateSection(idx, { badge: e.target.value })}
                      placeholder="Badge Tag"
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.active !== false}
                        onChange={(e) => handleUpdateSection(idx, { active: e.target.checked })}
                        className="rounded text-[#003366]"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Heading</label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleUpdateSection(idx, { heading: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Description Body</label>
                  <textarea
                    rows={3}
                    value={section.body}
                    onChange={(e) => handleUpdateSection(idx, { body: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Action Button Text</label>
                    <input
                      type="text"
                      value={section.linkText || ''}
                      onChange={(e) => handleUpdateSection(idx, { linkText: e.target.value })}
                      placeholder="e.g. View Details"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1 text-[11px] dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Link URL</label>
                    <input
                      type="text"
                      value={section.linkUrl || ''}
                      onChange={(e) => handleUpdateSection(idx, { linkUrl: e.target.value })}
                      placeholder="e.g. /employers/register"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1 text-[11px] dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. COMPANIES TAB */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-[#003366] dark:bg-sky-950/40 dark:text-sky-300 border border-blue-200/50">
              <span className="font-bold">Enterprise Directory:</span> Toggle which partner companies appear on the
              public portal, feature them on the spotlight carousel, and verify candidate tracks.
            </div>

            <div className="space-y-2">
              {partnersList.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#003366] dark:border-slate-700 dark:bg-slate-900">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{partner.name}</h4>
                        {partner.featured && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{partner.industry || partner.partnershipType || 'Enterprise Partner'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePartnerFeatured(partner.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                        partner.featured
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {partner.featured ? '⭐ Featured' : 'Feature'}
                    </button>
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partner.active !== false}
                        onChange={() => handleTogglePartner(partner.id)}
                        className="rounded text-[#003366]"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FAQS TAB */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Frequently Asked Questions</span>
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500"
              >
                <Plus className="h-3 w-3" />
                <span>Add FAQ</span>
              </button>
            </div>

            {(pageData.faqs || []).map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">FAQ #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, { question: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, { answer: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. CTAS TAB */}
        {activeTab === 'cta' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Primary Call-To-Action
              </h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Button Label</label>
                <input
                  type="text"
                  value={pageData.primaryCtaText || ''}
                  onChange={(e) => updatePage({ primaryCtaText: e.target.value })}
                  placeholder="e.g. Register as Employer"
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Destination Route / Link</label>
                <input
                  type="text"
                  value={pageData.primaryCtaLink || ''}
                  onChange={(e) => updatePage({ primaryCtaLink: e.target.value })}
                  placeholder="e.g. /employers/register"
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Secondary Call-To-Action
              </h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Button Label</label>
                <input
                  type="text"
                  value={pageData.secondaryCtaText || ''}
                  onChange={(e) => updatePage({ secondaryCtaText: e.target.value })}
                  placeholder="e.g. View Opportunities"
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Destination Route / Link</label>
                <input
                  type="text"
                  value={pageData.secondaryCtaLink || ''}
                  onChange={(e) => updatePage({ secondaryCtaLink: e.target.value })}
                  placeholder="e.g. /partners"
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/90 flex items-center justify-between">
        <a
          href="/cms/partners"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] hover:underline dark:text-sky-400"
        >
          <span>Open Full CMS Studio</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Publish Now</span>
        </button>
      </div>
    </aside>
  );
}
