import { SavedToolResult } from '../types/tools.types';

const FAVORITES_KEY = 'astu_alumni_tools_favorites';
const HISTORY_KEY = 'astu_alumni_tools_history';
const RECENT_KEY = 'astu_alumni_tools_recent';

export const toolsService = {
  // Favorites management
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : ['cv-builder', 'job-match-checker', 'ethiopian-salary-explorer', 'gpa-calculator'];
    } catch {
      return ['cv-builder', 'job-match-checker', 'ethiopian-salary-explorer', 'gpa-calculator'];
    }
  },

  toggleFavorite(toolId: string): string[] {
    const current = this.getFavorites();
    const next = current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId];
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    return next;
  },

  // Recently used tools
  getRecentTools(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : ['gpa-calculator', 'ethiopian-salary-explorer', 'cv-builder'];
    } catch {
      return ['gpa-calculator', 'ethiopian-salary-explorer', 'cv-builder'];
    }
  },

  addRecentTool(toolId: string): string[] {
    const current = this.getRecentTools().filter((id) => id !== toolId);
    const next = [toolId, ...current].slice(0, 10);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    return next;
  },

  // Saved calculation results history
  getSavedResults(): SavedToolResult[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveResult(result: SavedToolResult): SavedToolResult[] {
    const current = this.getSavedResults();
    const next = [result, ...current].slice(0, 50);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    return next;
  },

  deleteResult(id: string): SavedToolResult[] {
    const current = this.getSavedResults();
    const next = current.filter((item) => item.id !== id);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    return next;
  },

  clearAllResults(): SavedToolResult[] {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error(e);
    }
    return [];
  }
};
