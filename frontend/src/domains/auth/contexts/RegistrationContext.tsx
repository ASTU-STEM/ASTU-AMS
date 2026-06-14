import React, { createContext, useContext, useState } from 'react';

export interface RegistrationDetails {
  studentId?: string;
  fullName: string;
  graduationYear: string;
  email: string;
  phone?: string;
  storedAt?: number;
}

interface RegistrationContextType {
  registrationDetails: RegistrationDetails | null;
  setRegistrationDetails: (details: RegistrationDetails | null) => void;
  clearRegistrationDetails: () => void;
  clearRegistration: () => void;
  maskedEmail: string;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
};

// 15 minutes TTL in milliseconds
const SESSION_TTL_MS = 15 * 60 * 1000;

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrationDetails, setRegistrationDetailsState] = useState<RegistrationDetails | null>(() => {
    try {
      const saved = sessionStorage.getItem('registration_details');
      if (!saved) return null;
      
      const details: RegistrationDetails = JSON.parse(saved);
      if (details.storedAt && Date.now() - details.storedAt > SESSION_TTL_MS) {
        sessionStorage.removeItem('registration_details');
        return null;
      }
      return details;
    } catch (e) {
      sessionStorage.removeItem('registration_details');
      return null;
    }
  });

  const setRegistrationDetails = (details: RegistrationDetails | null) => {
    if (details) {
      const detailsWithTimestamp = {
        ...details,
        storedAt: Date.now()
      };
      setRegistrationDetailsState(detailsWithTimestamp);
      sessionStorage.setItem('registration_details', JSON.stringify(detailsWithTimestamp));
    } else {
      setRegistrationDetailsState(null);
      sessionStorage.removeItem('registration_details');
    }
  };

  const clearRegistrationDetails = () => {
    setRegistrationDetailsState(null);
    sessionStorage.removeItem('registration_details');
  };

  const clearRegistration = () => {
    clearRegistrationDetails();
  };

  const maskedEmail = registrationDetails ? maskEmail(registrationDetails.email) : '';

  return (
    <RegistrationContext.Provider 
      value={{ 
        registrationDetails, 
        setRegistrationDetails, 
        clearRegistrationDetails,
        clearRegistration,
        maskedEmail 
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
