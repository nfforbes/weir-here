import { IMenuItem } from '../types';

export const PUBLIC_MENU: IMenuItem[] = [
  { label: 'Home', path: '/', icon: 'Home' },
  {
    label: 'Solutions',
    path: '/solutions',
    icon: 'Lightbulb',
    children: [
      { label: 'For Employers', path: '/solutions/employers', icon: 'Business' },
      { label: 'For Job Seekers', path: '/solutions/job-seekers', icon: 'PersonSearch' },
    ],
  },
  {
    label: 'Careers',
    path: '/dashboard',
    icon: 'WorkOutline',
    children: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard', requiresAuth: true },
      { label: 'Postings', path: '/dashboard/postings', icon: 'PostAdd', requiresAuth: true },
      { label: 'Job Board', path: '/jobs', icon: 'WorkOutline', requiresAuth: true },
    ],
  },
  { label: 'Industries', path: '/industries', icon: 'Factory' },
  { label: 'About Us', path: '/about', icon: 'Info' },
  { label: 'Contact Us', path: '/contact', icon: 'ContactMail' },
];

export const AUTHENTICATED_MENU: IMenuItem[] = [
  {
    label: 'My Jobs',
    path: '/dashboard/my-jobs',
    icon: 'PostAdd',
    requiresAuth: true,
    requiredPersonas: ['user'],
  },
];

export const ADMIN_MENU: IMenuItem[] = [
  {
    label: 'Admin Settings',
    path: '/dashboard/admin/settings',
    icon: 'AdminPanelSettings',
    requiresAuth: true,
    requiredPersonas: ['administrator'],
  },
];
