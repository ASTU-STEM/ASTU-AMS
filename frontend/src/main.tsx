import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/material-symbols-outlined/400.css";
import App from "./App";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";
import { applyTheme, readStoredTheme } from "./hooks/useTheme";

// Re-applied here (in addition to the inline bootstrap in index.html) so the
// class and color-scheme are correct before the first React render. Reusing the
// hook's helpers keeps the prefers-color-scheme fallback identical to the one
// useTheme() will read, which this inline copy previously ignored.
applyTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
