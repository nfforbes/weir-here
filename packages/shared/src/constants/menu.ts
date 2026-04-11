import { IMenuItem } from '../types';

export const PUBLIC_MENU: IMenuItem[] = [
  { label: 'Home', path: '/', icon: 'Home' },
  {
    label: 'Solutions',
    path: '/solutions',
    icon: 'Lightbulb',
    children: [
      { label: 'Staffing Solutions', path: '/staffing-solutions-jamaica', icon: 'BusinessCenter' },
      { label: 'Medical Professionals', path: '/solutions/medical-professionals', icon: 'LocalHospital' },
      { label: 'Physicians & Advanced Practice', path: '/solutions/physicians-advanced-practice', icon: 'MedicalServices' },
      { label: 'Registered Nurses', path: '/solutions/registered-nurses', icon: 'Healing' },
      { label: 'Licensed Practical Nurses', path: '/solutions/licensed-practical-nurses', icon: 'AssignmentInd' },
      { label: 'Geriatric Nurses', path: '/solutions/geriatric-nurses', icon: 'AccessibilityNew' },
      { label: 'Babysitting Services', path: '/babysitting-services-jamaica', icon: 'ChildCare' },
      { label: 'Domestic Care', path: '/domestic-care-jamaica', icon: 'HomeWork' },
      { label: 'Housekeeping', path: '/solutions/housekeeping', icon: 'CleaningServices' },
      { label: 'Tutoring', path: '/tutoring-jamaica', icon: 'School' },
    ],
  },
  {
    label: 'Careers',
    path: '/dashboard',
    icon: 'WorkOutline',
    children: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard', requiresAuth: true },
      { label: 'Postings', path: '/dashboard/postings', icon: 'PostAdd', requiresAuth: true },
      /** Public job listings — visible without login; apply flow may still require auth. */
      { label: 'Job Board', path: '/jobs', icon: 'WorkOutline' },
    ],
  },
  { label: 'About Us', path: '/about', icon: 'Info' },
  { label: 'Testimonials', path: '/testimonials', icon: 'FormatQuote' },
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
    label: 'Configuration',
    path: '/dashboard/admin',
    icon: 'Tune',
    requiresAuth: true,
    requiredPersonas: ['administrator'],
    children: [
      {
        label: 'Users',
        path: '/dashboard/admin/users',
        icon: 'Group',
        requiresAuth: true,
        requiredPersonas: ['administrator'],
      },
      {
        label: 'Settings',
        path: '/dashboard/admin/settings',
        icon: 'Settings',
        requiresAuth: true,
        requiredPersonas: ['administrator'],
      },
      {
        label: 'Testimonials',
        path: '/dashboard/admin/testimonials',
        icon: 'FormatQuote',
        requiresAuth: true,
        requiredPersonas: ['administrator'],
      },
    ],
  },
];
