import React, { useState, useMemo } from 'react';
import { ToolItem, ToolCategory, ToolType, SavedToolResult } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { TOOL_CATEGORIES } from '../data/toolCategories';

// Categories that actually contain tools
const POPULATED_CATEGORY_COUNT = new Set(TOOL_REGISTRY.map((t) => t.category)).size;
import { toolsService } from '../services/toolsService';

import { ToolCard } from '../components/ToolCard';
import { QuickToolsRow } from '../components/QuickToolsRow';
import { RecommendedToolsRow } from '../components/RecommendedToolsRow';
import { ToolFilters } from '../components/ToolFilters';
import { ToolRunnerModal } from '../components/ToolRunnerModal';
import { SavedResultsView } from '../components/SavedResultsView';

import { History, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlumniSectionShell } from '../../alumni/components/AlumniSectionShell';
import { AlumniSectionBlock } from '../../alumni/components/AlumniSectionBlock';
import {
  alumniGhostBtnClass,
  alumniGridGapClass,
  alumniPrimaryBtnClass,
  alumniStatusBadge,
} from '../../alumni/components/alumniUi';
import { formatEmploymentStatus } from '../../alumni/utils/statusUi';
import { ALL_TOOL_TYPES } from '../utils/toolUi';
import { ToolTypeBadge } from '../components/ToolTypeBadge';

interface AlumniToolsPageProps {
  profile?: any;
  jobs?: any[];
  surveys?: any[];
  mentors?: any[];
  documents?: any[];
}

export const AlumniToolsPage: React.FC<AlumniToolsPageProps> = ({
  profile,
  jobs = [],
  surveys = [],
  mentors = [],
  documents = [],
}) => {
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all' | 'favorites'>('all');
  const [selectedType, setSelectedType] = useState<ToolType | 'all'>('all');

  // Interactive Execution Modal State
  const [activeToolModal, setActiveToolModal] = useState<ToolItem | null>(null);

  // Favorites & History state
  const [favorites, setFavorites] = useState<string[]>(() => toolsService.getFavorites());
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => toolsService.getRecentTools());
  const [savedResults, setSavedResults] = useState<SavedToolResult[]>(() => toolsService.getSavedResults());

  const handleToggleFavorite = (toolId: string) => {
    const nextFavs = toolsService.toggleFavorite(toolId);
    setFavorites(nextFavs);
    if (nextFavs.includes(toolId)) {
      toast.success('Added tool to favorites! ⭐');
    } else {
      toast('Removed from favorites', { icon: '🔖' });
    }
  };

  const handleOpenTool = (tool: ToolItem) => {
    setActiveToolModal(tool);
    const nextRecents = toolsService.addRecentTool(tool.id);
    setRecentToolIds(nextRecents);
  };

  const handleSaveResult = (result: SavedToolResult) => {
    const nextResults = toolsService.saveResult(result);
    setSavedResults(nextResults);
  };

  const handleDeleteResult = (id: string) => {
    const nextResults = toolsService.deleteResult(id);
    setSavedResults(nextResults);
    toast.success('Saved calculation result deleted');
  };

  const handleClearAllResults = () => {
    if (window.confirm('Are you sure you want to clear your saved calculation history?')) {
      const nextResults = toolsService.clearAllResults();
      setSavedResults(nextResults);
      toast.success('Tool history cleared');
    }
  };

  const handleClearRecentTools = () => {
    try {
      localStorage.removeItem('astu_alumni_tools_recent');
    } catch (_) {}
    setRecentToolIds([]);
    toast.success('Recent tools cleared');
  };

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TOOL_CATEGORIES.forEach((cat) => {
      counts[cat.id] = TOOL_REGISTRY.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, []);

  // Filtered tools catalog calculation
  const filteredTools = useMemo(() => {
    return TOOL_REGISTRY.filter((tool) => {
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(tool.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (tool.category !== selectedCategory) return false;
      }

      if (selectedType !== 'all') {
        if (tool.toolType !== selectedType) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesTags = tool.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesCategory = tool.category.toLowerCase().includes(q);

        const matchesMoney = (q === 'money' || q === 'birr' || q === 'etb') && (tool.category === 'finance' || tool.category === 'ethiopia_finance');
        const matchesJob = q === 'job' && (tool.category === 'jobs' || tool.category === 'ethiopia_jobs');
        const matchesDegree = (q === 'degree' || q === 'gpa' || q === 'master' || q === 'phd') && (tool.category === 'academic' || tool.category === 'postgraduate');

        if (!matchesName && !matchesDesc && !matchesTags && !matchesCategory && !matchesMoney && !matchesJob && !matchesDegree) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedType, favorites]);

  const recentTools = useMemo(() => {
    return recentToolIds
      .map((id) => TOOL_REGISTRY.find((t) => t.id === id))
      .filter((t): t is ToolItem => t !== undefined);
  }, [recentToolIds]);

  const toolTypeCounts = useMemo(() => {
    const counts: Partial<Record<(typeof ALL_TOOL_TYPES)[number], number>> = {};
    ALL_TOOL_TYPES.forEach((type) => {
      counts[type] = TOOL_REGISTRY.filter((t) => t.toolType === type).length;
    });
    return counts;
  }, []);

  const employmentLabel = formatEmploymentStatus(profile?.employmentStatus);
  const departmentLabel = profile?.department?.name || 'ASTU Graduate';

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <AlumniSectionShell
        eyebrow="Career & innovation suite"
        title="Alumni tools"
        description="Calculators, CV helpers, financial guides, and career utilities tailored for ASTU graduates in Ethiopia and abroad."
        metrics={[
          { value: TOOL_REGISTRY.length, label: 'Tools', accent: 'gold' },
          { value: POPULATED_CATEGORY_COUNT, label: 'Categories', accent: 'white' },
          { value: favorites.length, label: 'Favorites', accent: 'white' },
          { value: savedResults.length, label: 'Saved runs', accent: 'green' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={
                activeTab === 'catalog'
                  ? 'inline-flex items-center rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#003366] shadow-md'
                  : alumniGhostBtnClass + ' !text-white/90 hover:!bg-white/10 hover:!text-white border border-white/20 px-4 py-2 text-xs'
              }
            >
              Browse tools
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={
                activeTab === 'history'
                  ? 'inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#003366] shadow-md'
                  : alumniGhostBtnClass + ' !text-white/90 hover:!bg-white/10 hover:!text-white border border-white/20 px-4 py-2 text-xs inline-flex items-center gap-1.5'
              }
            >
              <History className="h-3.5 w-3.5" />
              Saved ({savedResults.length})
            </button>
          </div>
        }
      >
      {activeTab === 'catalog' && (
        <>
          <AlumniSectionBlock
            title="Your alumni status"
            description="Recommendations and quick picks adapt to your profile and employment stage."
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className={alumniStatusBadge.brand}>
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  {departmentLabel}
                </span>
                <span className={alumniStatusBadge.info}>
                  <span className="material-symbols-outlined text-[14px]">work</span>
                  {employmentLabel}
                </span>
                {recentToolIds.length > 0 && (
                  <span className={alumniStatusBadge.neutral}>
                    {recentToolIds.length} recent in this browser
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_TOOL_TYPES.filter((type) => (toolTypeCounts[type] ?? 0) > 0).map((type) => {
                  const active = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(active ? 'all' : type)}
                      className={`inline-flex items-center gap-1.5 rounded-full transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]/30 ${
                        active ? 'ring-2 ring-[#003366]/40 dark:ring-[#FFCC00]/40' : ''
                      }`}
                      title={`${active ? 'Clear' : 'Filter by'} this type (${toolTypeCounts[type]} tools)`}
                    >
                      <ToolTypeBadge toolType={type} compact />
                      <span className="rounded-full bg-[var(--bg-card)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--text-muted)] border border-[var(--border-color)]">
                        {toolTypeCounts[type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </AlumniSectionBlock>

          {/* ── 2. Quick Tools Launchpad ─────────────────────────────── */}
          <QuickToolsRow onOpenTool={handleOpenTool} />

          {/* ── 3. Recommended for You (Profile-Tailored) ──────────── */}
          <RecommendedToolsRow profile={profile} onOpenTool={handleOpenTool} />

          {recentTools.length > 0 && (
            <AlumniSectionBlock
              step={3}
              title="Recently used"
              description="Pick up where you left off — your last opened tools in this browser."
              aside={
                <button type="button" onClick={handleClearRecentTools} className={alumniGhostBtnClass + ' text-xs'}>
                  Clear recent
                </button>
              }
            >
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {recentTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleOpenTool(tool)}
                    className="flex shrink-0 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-left shadow-xs transition-all hover:border-[#003366]/30 dark:hover:border-[#FFCC00]/30"
                  >
                    <span className="material-symbols-outlined text-xl text-[#003366] dark:text-[#FFD700]">
                      {tool.icon}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                      {tool.name}
                    </span>
                  </button>
                ))}
              </div>
            </AlumniSectionBlock>
          )}

          <AlumniSectionBlock
            step={recentTools.length > 0 ? 4 : 3}
            title="Find tools"
            description="Search by keyword, filter by type, or browse categories."
          >
            <ToolFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              favoritesCount={favorites.length}
              categoryCounts={categoryCounts}
              totalTools={TOOL_REGISTRY.length}
            />
          </AlumniSectionBlock>

          <AlumniSectionBlock
            step={recentTools.length > 0 ? 5 : 4}
            title={
              selectedCategory === 'all'
                ? 'Full catalog'
                : selectedCategory === 'favorites'
                  ? 'My favorites'
                  : TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Category'
            }
            description={`Showing ${filteredTools.length} of ${TOOL_REGISTRY.length} tools across ${POPULATED_CATEGORY_COUNT} categories.`}
            aside={
              <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                {filteredTools.length} results
              </span>
            }
          >
            {filteredTools.length > 0 ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${alumniGridGapClass}`}>
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenTool={handleOpenTool}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] p-12 text-center">
                <Compass className="mb-4 h-10 w-10 text-[var(--text-muted)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {searchQuery
                    ? 'No tools matched your search'
                    : selectedCategory !== 'all'
                      ? 'This category has no tools yet'
                      : 'No tools found'}
                </h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">
                  {searchQuery
                    ? `Nothing matched "${searchQuery}". Try "salary", "CV", "GPA", or "Ethiopia".`
                    : selectedCategory !== 'all'
                      ? `"${TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}" has no tools yet.`
                      : 'No tools match the selected filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                  className={alumniPrimaryBtnClass + ' mt-6 text-xs'}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </AlumniSectionBlock>
        </>
      )}

      {activeTab === 'history' && (
        <AlumniSectionBlock
          step={1}
          title="Saved tool runs"
          description="Calculators and generators you saved from this browser — copy summaries or clear history anytime."
        >
          <SavedResultsView
            savedResults={savedResults}
            onDeleteResult={handleDeleteResult}
            onClearAll={handleClearAllResults}
            onBrowseTools={() => setActiveTab('catalog')}
          />
        </AlumniSectionBlock>
      )}
      </AlumniSectionShell>

      {/* ── INTERACTIVE TOOL RUNNER MODAL ─────────────────────────────── */}
      <ToolRunnerModal
        tool={activeToolModal}
        profile={profile}
        jobs={jobs}
        surveys={surveys}
        mentors={mentors}
        documents={documents}
        onClose={() => setActiveToolModal(null)}
        onSaveResult={handleSaveResult}
      />
    </div>
  );
};

export default AlumniToolsPage;
