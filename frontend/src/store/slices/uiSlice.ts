import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  notificationPanelOpen: boolean;
  globalLoading: boolean;
}

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  mobileMenuOpen: false,
  notificationPanelOpen: false,
  globalLoading: false,
};

// Theming deliberately lives in src/hooks/useTheme.ts, not here. This slice
// used to carry a second toggleDarkMode/setDarkMode pair that wrote the same
// localStorage key and the same <html> class. Nothing ever dispatched them, so
// they were dead code that would silently diverge from the real implementation.
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebar_collapsed', String(action.payload));
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    setNotificationPanelOpen(state, action: PayloadAction<boolean>) {
      state.notificationPanelOpen = action.payload;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setMobileMenuOpen,
  setNotificationPanelOpen,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
