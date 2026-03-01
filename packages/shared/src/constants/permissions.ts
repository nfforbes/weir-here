import { Persona } from '../types';

export const PERMISSIONS = {
  VIEW_HOME: 'view:home',
  VIEW_ABOUT: 'view:about',
  VIEW_CONTACT: 'view:contact',
  VIEW_SOLUTIONS: 'view:solutions',
  VIEW_INDUSTRIES: 'view:industries',
  VIEW_JOB_BOARD: 'view:job_board',
  VIEW_JOB_DETAIL: 'view:job_detail',
  APPLY_JOB: 'apply:job',
  POST_JOB: 'post:job',
  MANAGE_OWN_JOBS: 'manage:own_jobs',
  REVIEW_APPLICATIONS: 'review:applications',
  MANAGE_USERS: 'manage:users',
  MANAGE_SETTINGS: 'manage:settings',
  MANAGE_ALL_JOBS: 'manage:all_jobs',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Persona | 'visitor', Permission[]> = {
  visitor: [
    PERMISSIONS.VIEW_HOME,
    PERMISSIONS.VIEW_ABOUT,
    PERMISSIONS.VIEW_CONTACT,
    PERMISSIONS.VIEW_SOLUTIONS,
    PERMISSIONS.VIEW_INDUSTRIES,
    PERMISSIONS.VIEW_JOB_BOARD,
    PERMISSIONS.VIEW_JOB_DETAIL,
  ],
  user: [
    PERMISSIONS.VIEW_HOME,
    PERMISSIONS.VIEW_ABOUT,
    PERMISSIONS.VIEW_CONTACT,
    PERMISSIONS.VIEW_SOLUTIONS,
    PERMISSIONS.VIEW_INDUSTRIES,
    PERMISSIONS.VIEW_JOB_BOARD,
    PERMISSIONS.VIEW_JOB_DETAIL,
    PERMISSIONS.APPLY_JOB,
    PERMISSIONS.POST_JOB,
    PERMISSIONS.MANAGE_OWN_JOBS,
    PERMISSIONS.REVIEW_APPLICATIONS,
  ],
  administrator: [
    PERMISSIONS.VIEW_HOME,
    PERMISSIONS.VIEW_ABOUT,
    PERMISSIONS.VIEW_CONTACT,
    PERMISSIONS.VIEW_SOLUTIONS,
    PERMISSIONS.VIEW_INDUSTRIES,
    PERMISSIONS.VIEW_JOB_BOARD,
    PERMISSIONS.VIEW_JOB_DETAIL,
    PERMISSIONS.APPLY_JOB,
    PERMISSIONS.POST_JOB,
    PERMISSIONS.MANAGE_OWN_JOBS,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_ALL_JOBS,
  ],
};

export function hasPermission(
  personas: Persona[],
  permission: Permission
): boolean {
  if (personas.length === 0) {
    return ROLE_PERMISSIONS.visitor.includes(permission);
  }
  return personas.some((p) => ROLE_PERMISSIONS[p]?.includes(permission));
}
