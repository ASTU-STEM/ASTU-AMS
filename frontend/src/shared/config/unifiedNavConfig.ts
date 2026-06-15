import React from 'react';
import { LayoutDashboard, BarChart3, FileBarChart, ClipboardList, Briefcase, Users, ShieldCheck, Bell, ScrollText, Shield, Settings, Sparkles } from 'lucide-react';

export interface UnifiedNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  section: string;
  tooltip?: string;
  badge?: string | number;
}

export const UNIFIED_NAV_ITEMS: UnifiedNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true, section: 'main', tooltip: 'Overview and key metrics' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, section: 'main', tooltip: 'View platform analytics' },
  { label: 'Reports', path: '/reports', icon: FileBarChart, section: 'main', tooltip: 'Generate & export reports' },
  { label: 'Surveys', path: '/surveys', icon: ClipboardList, section: 'main', badge: '3', tooltip: '3 active surveys' },
  { label: 'Jobs', path: '/jobs', icon: Briefcase, section: 'main', badge: '47', tooltip: '47 active job posts' },
  { label: 'Users', path: '/users', icon: Users, section: 'system', badge: '142', tooltip: '142 pending verifications' },
  { label: 'Roles', path: '/roles', icon: ShieldCheck, section: 'system', tooltip: 'Manage roles & permissions' },
  { label: 'Notifications', path: '/notifications', icon: Bell, section: 'settings', badge: '5', tooltip: '5 unread notifications' },
  { label: 'System Logs', path: '/logs', icon: ScrollText, section: 'settings', tooltip: 'Audit trail & system logs' },
  { label: 'Backup & Security', path: '/backup', icon: Shield, section: 'settings', tooltip: 'Backup & security settings' },
  { label: 'Settings', path: '/settings', icon: Settings, section: 'settings', tooltip: 'System configuration' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, section: 'settings', tooltip: 'AI-powered analytics assistant' },
];

export const UNIFIED_SECTIONS = [
  { key: 'main', label: 'Main Navigation' },
  { key: 'system', label: 'System Administration' },
  { key: 'settings', label: 'Configuration' },
];

export const getUnifiedNavItemsBySection = (sectionKey: string) => 
  UNIFIED_NAV_ITEMS.filter(item => item.section === sectionKey);
