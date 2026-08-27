import React from 'react';
import { TelegramChat } from '../../../components/TelegramChat';

interface MessagingTabProps {
  darkMode: boolean;
  userId?: string;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  return <TelegramChat darkMode={darkMode} />;
};