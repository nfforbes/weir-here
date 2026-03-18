import { IMenuItem } from '../types';

export const PUBLIC_MENU: IMenuItem[] = [
  { label: 'Home', path: '/', icon: 'Home' },
  {
    label: 'Solutions',
    path: '/solutions',
    icon: 'Lightbulb',
    children: [
      { label: 'Medical Professionals', path: '/solutions/medical-professionals', icon: 'LocalHospital' },
      { label: 'Physicians & Advanced Practice Providers', path: '/solutions/physicians-advanced-practice', icon: 'MedicalServices' },
      { label: 'Licensed Practical Nurses', path: '/solutions/licensed-practical-nurses', icon: 'HealthAndSafety' },
      { label: 'Registered Nurses', path: '/solutions/registered-nurses', icon: 'HealthAndSafety' },
      { label: 'Geriatric Nurses', path: '/solutions/geriatric-nurses', icon: 'HealthAndSafety' },
      { label: 'Certified Babysitter', path: '/solutions/certified-babysitter', icon: 'HealthAndSafety' },
      { label: 'Support Staff', path: '/solutions/support-staff', icon: 'People' },
      { label: 'Travel and Temporary Staffing', path: '/solutions/travel-temporary-staffing', icon: 'TravelExplore' },
      { label: 'Domestic Care', path: '/solutions/domestic-care', icon: 'HomeWork' },
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
