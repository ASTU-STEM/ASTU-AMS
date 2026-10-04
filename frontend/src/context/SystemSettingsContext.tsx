import React, { createContext, useContext, useEffect, useState } from 'react';
import config from '../config';

export interface SystemSettingsState {
  general: {
    universityName: string;
    abbreviation: string;
    website: string;
    contactEmail: string;
    address: string;
    academicYear: string;
    language: string;
    timezone: string;
    dateFormat: string;
    phoneNumber: string;
    supportEmail: string;
    postalCode: string;
    portalTitle: string;
    siteName: string;
    tagline: string;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    fromName: string;
    fromEmail: string;
  };
  integrations: {
    regApiToggle: boolean;
    smsToggle: boolean;
    googleToggle: boolean;
    linkedinToggle: boolean;
    regApiEndpoint: string;
    regApiKey: string;
    smsGatewayUser: string;
    googleClientId: string;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
    logoUrl: string;
  };
}

export const DEFAULT_FRONTEND_SETTINGS: SystemSettingsState = {
  general: {
    universityName: 'Adama Science and Technology University',
    abbreviation: 'ASTU',
    website: 'https://astu.edu.et',
    contactEmail: 'admin@astu.edu.et',
    address: 'Adama, Ethiopia',
    academicYear: '2024-25',
    language: 'English',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    phoneNumber: '+251 22 110 0001',
    supportEmail: 'support@astu.edu.et',
    postalCode: 'P.O. Box 1888, Adama, Ethiopia',
    portalTitle: 'Alumni Management System',
    siteName: 'ASTU Alumni',
    tagline: 'Graduate Network',
  },
  email: {
    smtpHost: 'smtp.astu.edu.et',
    smtpPort: '587',
    smtpUser: 'mailer@astu.edu.et',
    fromName: 'ASTU Alumni Management System',
    fromEmail: 'noreply@astu.edu.et',
  },
  integrations: {
    regApiToggle: true,
    smsToggle: true,
    googleToggle: false,
    linkedinToggle: true,
    regApiEndpoint: 'https://api.astu.edu.et/erp',
    regApiKey: 'astu_erp_xxxxx',
    smsGatewayUser: 'astu_sms',
    googleClientId: 'google-client-id.apps.googleusercontent.com',
  },
  appearance: {
    primaryColor: '#003580',
    accentColor: '#E8A020',
    logoUrl: 'images/astu-seal-logo.png',
  },
};

interface SystemSettingsContextType {
  settings: SystemSettingsState;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettingsState: (newSettings: Partial<SystemSettingsState>) => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType>({
  settings: DEFAULT_FRONTEND_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettingsState: () => {},
});

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettingsState>(DEFAULT_FRONTEND_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Absolute base URL: there is no dev proxy, so a relative '/api/...' would
      // be resolved against the Vite origin and never reach the backend.
      const response = await fetch(`${config.apiUrl}/admin/settings/public`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings((prev) => ({
            ...prev,
            general: {
              ...prev.general,
              ...(result.data.general || {}),
            },
            appearance: {
              ...prev.appearance,
              ...(result.data.appearance || {}),
            },
          }));
        }
      }
    } catch (err) {
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (settings.appearance?.primaryColor) {
        root.style.setProperty('--primary-color', settings.appearance.primaryColor);
        root.style.setProperty('--brand-primary', settings.appearance.primaryColor);
        root.style.setProperty('--color-primary', settings.appearance.primaryColor);
      }
      if (settings.appearance?.accentColor) {
        root.style.setProperty('--accent-color', settings.appearance.accentColor);
        root.style.setProperty('--brand-accent', settings.appearance.accentColor);
        root.style.setProperty('--color-accent', settings.appearance.accentColor);
      }
      if (settings.general?.portalTitle) {
        document.title = settings.general.portalTitle;
      }
    }
  }, [settings]);

  const updateSettingsState = (newSettings: Partial<SystemSettingsState>) => {
    setSettings((prev) => {
      const merged = { ...prev };
      if (newSettings.general) merged.general = { ...prev.general, ...newSettings.general };
      if (newSettings.email) merged.email = { ...prev.email, ...newSettings.email };
      if (newSettings.integrations) merged.integrations = { ...prev.integrations, ...newSettings.integrations };
      if (newSettings.appearance) merged.appearance = { ...prev.appearance, ...newSettings.appearance };
      return merged;
    });
  };

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettingsState,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
