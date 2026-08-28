import React from 'react';
import { TelegramChat } from '../../../components/TelegramChat';

interface MessagingTabProps {
  darkMode: boolean;
  initialTarget?: any;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode, initialTarget }) => {
  return <TelegramChat darkMode={darkMode} initialTarget={initialTarget} />;
};
