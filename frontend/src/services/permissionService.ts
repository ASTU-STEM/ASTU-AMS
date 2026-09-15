import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from './api';

export type RoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'REGISTRAR'
  | 'DEPARTMENT_HEAD'
  | 'ALUMNI_OFFICE'
  | 'EMPLOYER'
  | 'ALUMNI';

export const defaultPermissions: Record<RoleKey, Record<string, boolean>> = {
  SUPER_ADMIN: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: true,
    suspend_users: true,
    manage_support_tickets: true,
    escalate_support_tickets: true,
    view_surveys: true,
    create_surveys: true,
    send_surveys: true,
    analyze_surveys: true,
    view_jobs: true,
    approve_jobs: true,
    manage_job_posts: true,
    feature_jobs: true,
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,
    view_reports: true,
    schedule_reports: true,
    approve_reports: true,
    view_system_settings: true,
    edit_system_settings: true,
    manage_security: true,
    import_data: true,
    export_data: true,
    sync_sis: true,
    manage_donations: true,
  },
  ADMIN: {
    // User Management
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: true,
    suspend_users: true,

    // Survey Management (Only view/analyze enabled; create & broadcast disabled for ICT Admin)
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: true,

    // Job Management (Only view enabled; approve, manage, feature disabled for ICT Admin)
    view_jobs: true,
    approve_jobs: false,
    manage_job_posts: false,
    feature_jobs: false,

    // Analytics & Reporting
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,

    // System Settings & Security
    view_system_settings: true,
    edit_system_settings: true,
    manage_security: true,
    import_data: true,
    sync_sis: true,

    // Technical Operations
    view_command_center: true,
    view_universal_logs: true,
    view_observability: true,
    trigger_incidents: true,
    provision_api_keys: true,
    toggle_feature_flags: true,
    revoke_active_sessions: true,
    export_data: true,
  },
  REGISTRAR: {
    view_student_records: true,
    import_data: true,
    sync_sis: true,
    approve_verifications: true,
    process_documents: true,
    export_reports: true,
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: false,
    suspend_users: true,
    view_surveys: true,
    analyze_surveys: true,
    view_dashboard: true,
    view_reports: true,
    schedule_reports: true,
    approve_reports: true,
  },
  DEPARTMENT_HEAD: {
    view_department_analytics: true,
    view_employer_feedback: true,
    analyze_surveys: true,
    view_surveys: true,
    view_dashboard: true,
    export_reports: true,
    view_reports: true,
  },
  ALUMNI_OFFICE: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: false,
    view_surveys: true,
    create_surveys: true,
    send_surveys: true,
    analyze_surveys: true,
    view_jobs: true,
    approve_jobs: true,
    manage_job_posts: true,
    feature_jobs: true,
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,
    view_reports: true,
    import_data: true,
    export_data: true,
  },
  EMPLOYER: {
    create_jobs: true,
    manage_job_posts: true,
    search_talent: true,
    submit_feedback: true,
    view_surveys: true,
    view_jobs: true,
    view_dashboard: true,
    view_employer_feedback: true,
    export_data: true,
  },
  ALUMNI: {
    edit_profile: true,
    verify_fayda_id: true,
    view_jobs: true,
    view_surveys: true,
  },
};

class PermissionService {
  private cache: Record<string, Record<string, boolean>> | null = null;
  private isFetching = false;

  async loadPermissions(): Promise<Record<string, Record<string, boolean>>> {
    if (this.cache) return this.cache;
    if (this.isFetching) {
      await new Promise(r => setTimeout(r, 200));
      return this.cache || {};
    }

    this.isFetching = true;
    try {
      const stored = localStorage.getItem('astu_role_permissions');
      if (stored) {
        this.cache = JSON.parse(stored);
      }

      const res = await apiClient.get<{ success: boolean; data: any }>('/admin/roles/permissions');
      if (res?.data?.success && res.data.data) {
        this.cache = res.data.data;
        localStorage.setItem('astu_role_permissions', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Failed to fetch role permissions from API, using fallback', err);
    } finally {
      this.isFetching = false;
    }

    return this.cache || {};
  }

  setCache(permissions: Record<string, Record<string, boolean>>) {
    this.cache = permissions;
    localStorage.setItem('astu_role_permissions', JSON.stringify(permissions));
    window.dispatchEvent(new Event('astu-permissions-updated'));
  }

  hasPermission(userRole: string | undefined | null, permissionKey: string): boolean {
    if (!userRole) return false;
    const roleUpper = userRole.toUpperCase() as RoleKey;
    if (roleUpper === 'SUPER_ADMIN') return true; // Super Admin has unrestricted access

    if (!this.cache) {
      const stored = localStorage.getItem('astu_role_permissions');
      if (stored) {
        try {
          this.cache = JSON.parse(stored);
        } catch {
          /* fallback */
        }
      }
    }

    if (this.cache && this.cache[roleUpper]) {
      const permValue = this.cache[roleUpper][permissionKey];
      if (typeof permValue === 'boolean') {
        return permValue;
      }
    }

    // Default fallback if not defined in custom permissions map
    const defaultRolePerms = defaultPermissions[roleUpper];
    if (defaultRolePerms && typeof defaultRolePerms[permissionKey] === 'boolean') {
      return defaultRolePerms[permissionKey];
    }

    return true;
  }

  enforcePermission(userRole: string | undefined | null, permissionKey: string, actionTitle: string): boolean {
    const allowed = this.hasPermission(userRole, permissionKey);
    if (!allowed) {
      toast.error(`🚫 Access Denied: "${actionTitle}" is restricted for role ${userRole} by System Policy.`, {
        duration: 4000,
        id: `perm-denied-${permissionKey}`,
      });
      return false;
    }
    return true;
  }

  showComingSoon(featureName: string) {
    toast(`🚀 Coming Soon in ASTU Portal: "${featureName}" module will be enabled in the next release phase.`, {
      icon: 'ℹ️',
      duration: 3500,
      id: `coming-soon-${featureName.replace(/\s+/g, '-').toLowerCase()}`,
    });
  }
}

export const permissionService = new PermissionService();

export function usePermission(permissionKey: string, userRole?: string | null) {
  const role = userRole || 'ADMIN';
  const [allowed, setAllowed] = useState<boolean>(() => permissionService.hasPermission(role, permissionKey));

  useEffect(() => {
    const handleUpdate = () => {
      setAllowed(permissionService.hasPermission(role, permissionKey));
    };
    window.addEventListener('astu-permissions-updated', handleUpdate);
    return () => window.removeEventListener('astu-permissions-updated', handleUpdate);
  }, [role, permissionKey]);

  return allowed;
}
