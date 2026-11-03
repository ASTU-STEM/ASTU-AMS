import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  Globe,
  HeartHandshake,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import { useAuth } from '../contexts/AuthContext';
import approvalService from '../features/admin/services/approval.service';
import {
  SidebarBrand,
  SidebarCollapseButton,
  SidebarFooter,
  SidebarNav,
  SidebarNavLink,
  SidebarSectionLabel,
  SidebarUserCard,
  sidebarShellClass,
} from './sidebarShared';

interface CmsSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface EnhancedNavItem extends AdminNavItem {
  badge?: string | number;
  section?: string;
  tooltip?: string;
}

const navItems: EnhancedNavItem[] = [
  { label: 'Dashboard', path: '/cms/dashboard', icon: LayoutDashboard, exact: true, section: 'alumni-office', tooltip: 'Alumni Office overview & statistics' },
  { label: 'Tracer Surveys', path: '/cms/surveys', icon: ClipboardList, section: 'alumni-office', tooltip: 'Longitudinal tracer study engine & cohorts' },
  { label: 'Analytics & Insights', path: '/cms/analytics', icon: BarChart3, section: 'alumni-office', tooltip: 'Employment rate, time-to-hire & skill gaps' },
  { label: 'Reports Center', path: '/cms/reports', icon: FileBarChart, section: 'alumni-office', tooltip: 'Official ETA & accreditation export dossiers' },
  { label: 'Registrations', path: '/cms/registrations', icon: ClipboardCheck, section: 'alumni-office', tooltip: 'Tracer study & event registrations' },
  { label: 'Events & Workshops', path: '/cms/events', icon: CalendarDays, section: 'alumni-office', tooltip: 'Manage alumni reunions & workshops' },
  { label: 'Jobs & Careers', path: '/cms/jobs', icon: Briefcase, section: 'alumni-office', tooltip: 'Job board moderation & placement tracking' },
  { label: 'Donations & Giving', path: '/cms/donations', icon: HeartHandshake, section: 'alumni-office', tooltip: 'Fundraising causes, Telebirr/Chapa campaigns & donor tracking' },
  { label: 'Messages', path: '/cms/messages', icon: MessageSquareText, section: 'alumni-office', tooltip: 'Internal messaging & communication' },
  { label: 'Notifications', path: '/cms/notifications', icon: Bell, section: 'alumni-office', tooltip: 'System notifications & alerts' },
  { label: 'Portal Page Controls', path: '/cms/menu-controls', icon: SlidersHorizontal, section: 'alumni-office', tooltip: 'Control & toggle sidebar menu pages for all actor portals' },
  { label: 'Pages & Homepage CMS', path: '/cms/homepage', icon: Layers3, section: 'content-management', tooltip: 'Manage homepage sections, Overview, Contact Us & institutional pages' },
  { label: 'RAG Knowledge Hub', path: '/cms/knowledge-hub', icon: Sparkles, section: 'content-management', tooltip: 'Institutional RAG documents & FAQs for Homepage AI Chatbot' },
  { label: 'Partners & Employers', path: '/cms/partners', icon: Building2, section: 'content-management', tooltip: 'Manage /partners portal, employer benefits & logos' },
  { label: 'Announcements', path: '/cms/content', icon: Newspaper, section: 'content-management', tooltip: 'Alumni announcements & public notices' },
  { label: 'Community', path: '/cms/community', icon: Users, section: 'content-management', tooltip: 'Community leadership, member roster, regional chapters & public page' },
  { label: 'Media & Gallery', path: '/cms/media-gallery', icon: ImageIcon, section: 'content-management', tooltip: 'Unified media library, asset uploads & campus photo gallery' },
  { label: 'SEO', path: '/cms/seo', icon: Globe, section: 'content-management', tooltip: 'Search engine optimization & indexing' },
  { label: 'Templates', path: '/cms/templates', icon: FileText, section: 'content-management', tooltip: 'Reusable content templates' },
  { label: 'Approvals', path: '/cms/approvals', icon: ShieldCheck, section: 'content-management', tooltip: 'Pending reviews & approvals' },
  { label: 'Settings', path: '/cms/settings', icon: Settings, section: 'content-management', tooltip: 'CMS & office configurations' },
];

const sections = [
  { key: 'alumni-office', label: 'Alumni Office' },
  { key: 'content-management', label: 'Content Management' },
];

export default function CmsSidebar({
  onLogout,
  isOpen = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: CmsSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const [pendingApprovals, setPendingApprovals] = useState(0);
  useEffect(() => {
    const refresh = () => {
      const items = approvalService.getItems();
      setPendingApprovals(
        items.filter((i) => i.status === 'Pending Review' || i.status === 'In Review').length
      );
    };
    refresh();
    window.addEventListener('astu-cms-approval-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('astu-cms-approval-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [location.pathname]);

  const getSectionItems = (sectionKey: string) =>
    navItems
      .filter((item) => item.section === sectionKey)
      .map((item) =>
        item.label === 'Approvals'
          ? { ...item, badge: pendingApprovals > 0 ? pendingApprovals : undefined }
          : item
      );

  const officerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Alumni Office Officer';
  const officerInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AO';

  return (
    <aside className={sidebarShellClass(collapsed, isOpen)} aria-label="CMS navigation">
      <SidebarBrand
        collapsed={collapsed}
        logoSrc="/images/astu-seal-logo.png"
        logoAlt="ASTU Logo"
        title="ASTU Alumni"
        subtitle="Alumni Affairs Office"
        onCloseMobile={onNavigate}
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
                      badge={item.badge}
                      onClick={onNavigate}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </SidebarNav>

      <SidebarFooter>
        <SidebarUserCard
          collapsed={collapsed}
          initials={officerInitials}
          name={officerName}
          role="Alumni Affairs Officer"
          email={user?.email}
          onLogout={onLogout}
          accentInitials
        />
        <SidebarCollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
      </SidebarFooter>
    </aside>
  );
}
