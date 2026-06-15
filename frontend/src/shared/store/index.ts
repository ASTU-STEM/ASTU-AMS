import { configureStore } from '@reduxjs/toolkit';

/**
 * Minimal Redux store.
 * Add feature slices here as they are developed (e.g. authSlice, uiSlice).
 */
export const store = configureStore({
  reducer: {
    // Placeholder reducer so the store is valid
    _placeholder: (state: null = null) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
