import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/material-symbols-outlined/400.css";
import App from "./App";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, applyTheme, readStoredTheme } from "./hooks/useTheme";

applyTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
