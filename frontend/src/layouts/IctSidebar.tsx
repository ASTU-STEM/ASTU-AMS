import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Globe,
  Key,
  Layers,
  LifeBuoy,
  ScrollText,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import {
  SidebarAiButton,
  SidebarBrand,
  SidebarCollapseButton,
  SidebarFooter,
  SidebarNav,
  SidebarNavLink,
  SidebarSectionLabel,
  SidebarUserCard,
  sidebarShellClass,
} from './sidebarShared';

interface IctSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiAssistant?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  section: string;
  tooltip?: string;
}

const navItems: NavItem[] = [
  { label: 'Command Center', path: '/ict/dashboard', icon: Terminal, exact: true, section: 'ops', tooltip: '360° System Health Matrix' },
  { label: 'Support Desk', path: '/ict/support-tickets', icon: LifeBuoy, section: 'ops', tooltip: 'Escalated support tickets from Super Admin' },
  { label: 'Logs & Diffs', path: '/ict/logs', icon: ScrollText, section: 'ops', tooltip: 'Universal logs and state mutation diffs' },
  { label: 'API Gateway', path: '/ict/api-gateway', icon: Globe, section: 'ops', tooltip: 'External API keys, rate limits & health' },
  { label: 'Security SOC', path: '/ict/security', icon: ShieldAlert, section: 'ops', tooltip: 'OWASP Top 10, threats & Break Glass' },
  { label: 'Observability', path: '/ict/observability', icon: Activity, section: 'ops', tooltip: 'Latency and distributed traces' },
  { label: 'Incidents', path: '/ict/incidents', icon: AlertTriangle, section: 'ops', tooltip: 'Incident lifecycle & disaster recovery' },

  { label: 'Audit Trail', path: '/ict/audit', icon: Shield, section: 'governance', tooltip: 'Immutable forensic audit & AI analysis' },
  { label: 'Integrations', path: '/ict/integrations', icon: Layers, section: 'governance', tooltip: 'Registrar sync & data quality' },
  { label: 'Feature Flags', path: '/ict/feature-flags', icon: Sliders, section: 'governance', tooltip: 'Rollouts, sandbox & rollback' },
  { label: 'Policies', path: '/ict/policies', icon: Key, section: 'governance', tooltip: 'Security policies & active sessions' },
  { label: 'Architecture', path: '/ict/architecture', icon: Sparkles, section: 'governance', tooltip: 'Topology map & ASTU AI' },
];

const sections = [
  { key: 'ops', label: 'Core Operations' },
  { key: 'governance', label: 'Security & Releases' },
];

export default function IctSidebar({
  onLogout,
  isOpen = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onOpenAiAssistant,
}: IctSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const getSectionItems = (sectionKey: string) =>
    navItems.filter((item) => item.section === sectionKey);

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ICT User'
    : 'ICT User';
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'IA'
    : 'IA';

  return (
    <aside className={sidebarShellClass(collapsed, isOpen)} aria-label="ICT navigation">
      <SidebarBrand
        collapsed={collapsed}
        logoSrc={settings.appearance?.logoUrl || '/images/astu-seal-logo.png'}
        logoAlt={`${settings.general?.abbreviation || 'ASTU'} Seal`}
        title={`${settings.general?.abbreviation || 'ASTU'} ICT`}
        subtitle="Systems Directorate"
        badge="Portal"
      />

      <SidebarNav>
        {sections.map((section) => {
          const items = getSectionItems(section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key}>
              {!collapsed && <SidebarSectionLabel>{section.label}</SidebarSectionLabel>}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <SidebarNavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      collapsed={collapsed}
                      isActive={isActive}
                      icon={item.icon}
                      label={item.label}
                      tooltip={item.tooltip}
                      onClick={() => onNavigate?.()}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </SidebarNav>

      <SidebarFooter>
        <SidebarAiButton
          collapsed={collapsed}
          onClick={onOpenAiAssistant}
          title="ICT AI Assistant"
          subtitle="Diagnostics & Security"
          tone="navy"
        />
        <SidebarUserCard
          collapsed={collapsed}
          initials={initials}
          name={displayName}
          role="ICT Administrator"
          email={user?.email}
          onLogout={onLogout}
        />
        <SidebarCollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
      </SidebarFooter>
    </aside>
  );
}
