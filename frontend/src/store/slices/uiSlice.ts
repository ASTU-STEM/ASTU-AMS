import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  mobileMenuOpen: boolean;
  notificationPanelOpen: boolean;
  globalLoading: boolean;
}

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  darkMode: localStorage.getItem('theme') === 'dark',
  mobileMenuOpen: false,
  notificationPanelOpen: false,
  globalLoading: false,
};

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
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(state.darkMode ? 'dark' : 'light');
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      localStorage.setItem('theme', action.payload ? 'dark' : 'light');
      // This previously only wrote localStorage, so calling setDarkMode left the
      // `light`/`dark` class on <html> untouched and the page never changed.
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(action.payload ? 'dark' : 'light');
      document.documentElement.style.colorScheme = action.payload ? 'dark' : 'light';
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
  toggleDarkMode,
  setDarkMode,
  setMobileMenuOpen,
  setNotificationPanelOpen,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
