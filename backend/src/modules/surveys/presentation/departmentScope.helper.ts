import prisma from '../../../core/config/db';
import { ApiError } from '../../../core/errors/ApiError';

export type AuthUser = {
  userId: string;
  role: string;
};

/**
 * Resolve department scope for a department head.
 * Throws if the user is a department head without an assigned profile.
 * Returns undefined for non-department-head roles (campus-wide allowed).
 */
export async function resolveDepartmentHeadScope(user: AuthUser | undefined | null): Promise<string | undefined> {
  if (!user || user.role !== 'DEPARTMENT_HEAD') {
    return undefined;
  }

  const deptHead = await prisma.departmentHeadProfile.findUnique({
    where: { userId: user.userId },
  });

  if (!deptHead?.departmentId) {
    throw new ApiError(
      'Department head profile not found. Assign a department before managing or dispatching surveys.',
      403
    );
  }

  return deptHead.departmentId;
}

const MILESTONE_TYPES = ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'];

/**
 * Ensure a department head can only mutate templates they own (or unscoped legacy CUSTOM they created).
 * Milestone templates remain admin-only for mutation (enforced elsewhere).
 */
export function assertDepartmentOwnsTemplate(
  role: string | undefined,
  departmentId: string | undefined,
  template: { departmentId?: string | null; type?: string } | null
) {
  if (role !== 'DEPARTMENT_HEAD' || !departmentId || !template) return;

  if (template.type && MILESTONE_TYPES.includes(template.type)) {
    throw new ApiError('Department heads cannot modify institutional milestone survey templates.', 403);
  }

  if (template.departmentId && template.departmentId !== departmentId) {
    throw new ApiError('You can only manage survey templates owned by your department.', 403);
  }

  // Legacy templates with no departmentId: allow read/dispatch only via list filter;
  // block destructive mutate unless they somehow own it (no departmentId = institutional).
  if (!template.departmentId) {
    throw new ApiError('Institutional survey templates can only be managed by Admin or Registrar.', 403);
  }
}

/**
 * Department heads may view/analyze templates they own or institutional milestones.
 */
export function assertDepartmentCanViewTemplate(
  departmentId: string | undefined,
  template: { departmentId?: string | null; type?: string } | null
) {
  if (!departmentId || !template) return;

  const owned = template.departmentId === departmentId;
  const isMilestone = !!template.type && MILESTONE_TYPES.includes(template.type);
  if (!owned && !isMilestone) {
    throw new ApiError('Survey template not found for your department.', 404);
  }
}
