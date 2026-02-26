import type { Persona, AppUser } from './auth';

export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  requiredPersonas?: Persona[];
  authRequired?: boolean;
  hasCompanyRequired?: boolean;
  sidebarItem?: boolean;
  children?: MenuItem[];
}

const allMenuItems: MenuItem[] = [
  { label: 'Home', href: '/', icon: 'Home' },
  {
    label: 'Solutions',
    href: '#',
    icon: 'Lightbulb',
    children: [
      { label: 'For Employers', href: '/solutions/employers', icon: 'Business' },
      { label: 'For Job Seekers', href: '/solutions/job-seekers', icon: 'PersonSearch' },
    ],
  },
  { label: 'Industries', href: '/industries', icon: 'Factory' },
  { label: 'About Us', href: '/about-us', icon: 'Info' },
  { label: 'Contact Us', href: '/contact-us', icon: 'ContactMail' },
  { label: 'Job Board', href: '/jobs', icon: 'Work' },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'Dashboard',
    authRequired: true,
    sidebarItem: true,
  },
  {
    label: 'Companies',
    href: '/dashboard/talent',
    icon: 'BusinessCenter',
    authRequired: true,
    hasCompanyRequired: true,
    sidebarItem: true,
  },
  {
    label: 'Postings',
    href: '/dashboard/postings',
    icon: 'PostAdd',
    authRequired: true,
    hasCompanyRequired: true,
    sidebarItem: true,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: 'People',
    requiredPersonas: ['administrator'],
    sidebarItem: true,
  },
  {
    label: 'Admin',
    href: '/admin/settings',
    icon: 'AdminPanelSettings',
    requiredPersonas: ['administrator'],
    sidebarItem: true,
  },
];

export function getMenuForUser(user: AppUser | null, hasCompanies = false): MenuItem[] {
  return allMenuItems
    .map((item) => filterMenuItem(item, user, hasCompanies))
    .filter((item): item is MenuItem => item !== null);
}

function filterMenuItem(item: MenuItem, user: AppUser | null, hasCompanies: boolean): MenuItem | null {
  if (item.authRequired && !user) return null;
  if (item.hasCompanyRequired && !hasCompanies) return null;
  if (item.requiredPersonas && item.requiredPersonas.length > 0) {
    if (!user) return null;
    const hasPersona = item.requiredPersonas.some((p) => user.personas.includes(p));
    if (!hasPersona) return null;
  }

  if (item.children) {
    const filteredChildren = item.children
      .map((child) => filterMenuItem(child, user, hasCompanies))
      .filter((child): child is MenuItem => child !== null);
    if (filteredChildren.length === 0) return null;
    return { ...item, children: filteredChildren };
  }

  return item;
}

export function hasPermission(user: AppUser | null, requiredPersonas: Persona[]): boolean {
  if (!user) return false;
  return requiredPersonas.some((p) => user.personas.includes(p));
}
