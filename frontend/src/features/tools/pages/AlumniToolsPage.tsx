import React, { useState, useMemo } from 'react';
import { ToolItem, ToolCategory, ToolType, SavedToolResult } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { TOOL_CATEGORIES } from '../data/toolCategories';

// Categories that actually contain tools. TOOL_CATEGORIES also defines
// ethiopia_jobs, which has zero tools, so counting the list overstated coverage.
const POPULATED_CATEGORY_COUNT = new Set(TOOL_REGISTRY.map((t) => t.category)).size;
import { toolsService } from '../services/toolsService';

import { ToolCard } from '../components/ToolCard';
import { QuickToolsRow } from '../components/QuickToolsRow';
import { RecommendedToolsRow } from '../components/RecommendedToolsRow';
import { ToolFilters } from '../components/ToolFilters';
import { ToolRunnerModal } from '../components/ToolRunnerModal';
import { SavedResultsView } from '../components/SavedResultsView';

import { Wrench, History, Compass, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. Hero Product Header Banner (Restored from Screenshot) ────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-r from-[#003366] via-[#004d99] to-[#1d9e75] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD700]/15 rounded-full blur-xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 border border-white/20">
              <Wrench className="h-3.5 w-3.5" />
              Career toolkit
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Alumni tools
            </h1>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
              Calculators, CV helpers, and career utilities for ASTU graduates in Ethiopia and abroad.
            </p>
          </div>

          {/* Quick Metrics Banner */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <span className="material-symbols-outlined text-amber-300 text-2xl">construction</span>
              <div>
                <p className="text-sm font-black text-white">{TOOL_REGISTRY.length} tools</p>
                <p className="text-[10px] text-white/70">{POPULATED_CATEGORY_COUNT} categories</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'catalog' ? 'bg-white text-[#003366] shadow-sm' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                Browse tools
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'history' ? 'bg-white text-[#003366] shadow-sm' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Saved ({savedResults.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: TOOLS CATALOG
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <>
          {/* ── 2. Quick Tools Launchpad ─────────────────────────────── */}
          <QuickToolsRow onOpenTool={handleOpenTool} />

          {/* ── 3. Recommended for You (Profile-Tailored) ──────────── */}
          <RecommendedToolsRow profile={profile} onOpenTool={handleOpenTool} />

          {/* ── 4. Recently Used Tools (if any) ──────────────────────── */}
          {recentTools.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-[#003366] dark:text-blue-400" />
                  Recently Used
                </h3>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {recentTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleOpenTool(tool)}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-2xs hover:border-[#003366] transition-all dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="material-symbols-outlined text-base text-[#003366] dark:text-blue-400">
                      {tool.icon}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {tool.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. Search & Category Filters Bar ────────────────────── */}
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

          {/* ── 6. Main Tools Grid Section ──────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedCategory === 'all'
                    ? 'All Tools Catalog'
                    : selectedCategory === 'favorites'
                    ? 'My Favorite Tools'
                    : TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Category Tools'}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {filteredTools.length} tools
                </span>
              </div>

                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  Showing {filteredTools.length} of {TOOL_REGISTRY.length} tools across {POPULATED_CATEGORY_COUNT} categories
                </span>
            </div>

            {/* Grid of Cards */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
                <Compass className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {searchQuery
                    ? 'No tools matched your search'
                    : selectedCategory !== 'all'
                      ? 'This category has no tools yet'
                      : 'No tools found'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm dark:text-slate-400">
                  {searchQuery
                    ? `Nothing matched "${searchQuery}". Try a broader term such as "salary", "CV", "GPA" or "Ethiopia".`
                    : selectedCategory !== 'all'
                      ? `"${TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}" is defined but no tools have been added to it yet.`
                      : 'No tools match the selected filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                  className="mt-4 rounded-xl bg-[#003366] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: SAVED TOOL RESULTS HISTORY
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <SavedResultsView
          savedResults={savedResults}
          onDeleteResult={handleDeleteResult}
          onClearAll={handleClearAllResults}
        />
      )}

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
