import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/material-symbols-outlined/400.css";
import App from "./App";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";

const savedTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(savedTheme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
