import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from '@weir-here/shared';
import { filterMenuForUser, isAdmin } from '@/lib/rbac';
import { PUBLIC_MENU, AUTHENTICATED_MENU, ADMIN_MENU } from '@weir-here/shared';

describe('RBAC - hasPermission', () => {
  it('grants visitors access to public pages', () => {
    expect(hasPermission([], PERMISSIONS.VIEW_HOME)).toBe(true);
    expect(hasPermission([], PERMISSIONS.VIEW_ABOUT)).toBe(true);
    expect(hasPermission([], PERMISSIONS.VIEW_JOB_BOARD)).toBe(true);
  });

  it('denies visitors access to protected actions', () => {
    expect(hasPermission([], PERMISSIONS.APPLY_JOB)).toBe(false);
    expect(hasPermission([], PERMISSIONS.POST_JOB)).toBe(false);
    expect(hasPermission([], PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
  });

  it('grants regular users job-related permissions', () => {
    expect(hasPermission(['user'], PERMISSIONS.APPLY_JOB)).toBe(true);
    expect(hasPermission(['user'], PERMISSIONS.POST_JOB)).toBe(false);
    expect(hasPermission(['user'], PERMISSIONS.MANAGE_OWN_JOBS)).toBe(true);
    expect(hasPermission(['user'], PERMISSIONS.REVIEW_APPLICATIONS)).toBe(true);
  });

  it('denies regular users admin permissions', () => {
    expect(hasPermission(['user'], PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
    expect(hasPermission(['user'], PERMISSIONS.MANAGE_USERS)).toBe(false);
    expect(hasPermission(['user'], PERMISSIONS.MANAGE_ALL_JOBS)).toBe(false);
  });

  it('grants administrators all permissions', () => {
    const allPerms = Object.values(PERMISSIONS);
    for (const perm of allPerms) {
      expect(hasPermission(['administrator'], perm)).toBe(true);
    }
  });

  it('grants only administrators permission to post jobs', () => {
    expect(hasPermission(['administrator'], PERMISSIONS.POST_JOB)).toBe(true);
    expect(hasPermission(['user', 'administrator'], PERMISSIONS.POST_JOB)).toBe(true);
  });

  it('grants access if any persona has the permission', () => {
    expect(hasPermission(['user', 'administrator'], PERMISSIONS.MANAGE_SETTINGS)).toBe(true);
  });
});

describe('RBAC - isAdmin', () => {
  it('returns true for administrator persona', () => {
    expect(isAdmin(['administrator'])).toBe(true);
    expect(isAdmin(['user', 'administrator'])).toBe(true);
  });

  it('returns false for non-admin personas', () => {
    expect(isAdmin([])).toBe(false);
    expect(isAdmin(['user'])).toBe(false);
  });
});

describe('RBAC - filterMenuForUser', () => {
  it('returns public menu items for visitors including Careers with Job Board (public listings)', () => {
    const filtered = filterMenuForUser(PUBLIC_MENU, [], false);
    expect(filtered).toHaveLength(PUBLIC_MENU.length);
    expect(filtered.map((i) => i.label)).toContain('Home');
    expect(filtered.map((i) => i.label)).toContain('Careers');
    expect(filtered.map((i) => i.label)).toContain('About Us');
    const careers = filtered.find((i) => i.label === 'Careers');
    expect(careers?.children?.map((c) => c.label)).toEqual(['Job Board']);
  });

  it('hides auth-required items for unauthenticated users', () => {
    const filtered = filterMenuForUser(AUTHENTICATED_MENU, [], false);
    expect(filtered).toHaveLength(0);
  });

  it('shows auth-required items for authenticated users', () => {
    const filtered = filterMenuForUser(AUTHENTICATED_MENU, ['user'], true);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.map((i) => i.label)).toContain('My Jobs');
  });

  it('hides admin menu from regular users', () => {
    const filtered = filterMenuForUser(ADMIN_MENU, ['user'], true);
    expect(filtered).toHaveLength(0);
  });

  it('shows admin menu to administrators', () => {
    const filtered = filterMenuForUser(ADMIN_MENU, ['administrator'], true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Configuration');
    expect(filtered[0].children?.map((c) => c.label)).toEqual(['Users', 'Settings', 'Testimonials']);
  });

  it('removes parent items with no visible children', () => {
    const menuWithChildren = [
      {
        label: 'Parent',
        path: '/parent',
        icon: 'Folder',
        children: [
          {
            label: 'Admin Child',
            path: '/admin-child',
            icon: 'Lock',
            requiresAuth: true,
            requiredPersonas: ['administrator' as const],
          },
        ],
      },
    ];
    const filtered = filterMenuForUser(menuWithChildren, ['user'], true);
    expect(filtered).toHaveLength(0);
  });
});

describe('ROLE_PERMISSIONS coverage', () => {
  it('defines permissions for visitor, user, and administrator', () => {
    expect(ROLE_PERMISSIONS.visitor).toBeDefined();
    expect(ROLE_PERMISSIONS.user).toBeDefined();
    expect(ROLE_PERMISSIONS.administrator).toBeDefined();
  });

  it('ensures administrator has all user permissions', () => {
    for (const perm of ROLE_PERMISSIONS.user) {
      expect(ROLE_PERMISSIONS.administrator).toContain(perm);
    }
  });

  it('ensures user has all visitor permissions', () => {
    for (const perm of ROLE_PERMISSIONS.visitor) {
      expect(ROLE_PERMISSIONS.user).toContain(perm);
    }
  });
});
