import { PUBLIC_MENU, AUTHENTICATED_MENU, ADMIN_MENU } from '@weir-here/shared';

describe('Menu definitions', () => {
  it('all public menu items have icon strings', () => {
    const checkIcons = (items: typeof PUBLIC_MENU) => {
      for (const item of items) {
        expect(item.icon).toBeTruthy();
        expect(typeof item.icon).toBe('string');
        if (item.children) checkIcons(item.children);
      }
    };
    checkIcons(PUBLIC_MENU);
    checkIcons(AUTHENTICATED_MENU);
    checkIcons(ADMIN_MENU);
  });

  it('all menu items have paths', () => {
    const checkPaths = (items: typeof PUBLIC_MENU) => {
      for (const item of items) {
        expect(item.path).toBeTruthy();
        expect(item.path.startsWith('/')).toBe(true);
        if (item.children) checkPaths(item.children);
      }
    };
    checkPaths(PUBLIC_MENU);
    checkPaths(AUTHENTICATED_MENU);
    checkPaths(ADMIN_MENU);
  });

  it('public menu includes expected items', () => {
    const labels = PUBLIC_MENU.map((i) => i.label);
    expect(labels).toContain('Home');
    expect(labels).toContain('Solutions');
    expect(labels).toContain('Careers');
    expect(labels).toContain('About Us');
    expect(labels).toContain('Contact Us');
  });

  it('Solutions menu has expected children', () => {
    const solutions = PUBLIC_MENU.find((i) => i.label === 'Solutions');
    expect(solutions).toBeDefined();
    expect(solutions!.children).toBeDefined();
    const childLabels = solutions!.children!.map((c) => c.label);
    expect(childLabels).toContain('Staffing Solutions');
    expect(childLabels).toContain('Medical Professionals');
  });

  it('Careers menu has Job Board as child', () => {
    const careers = PUBLIC_MENU.find((i) => i.label === 'Careers');
    expect(careers).toBeDefined();
    expect(careers!.children).toBeDefined();
    const childLabels = careers!.children!.map((c) => c.label);
    expect(childLabels).toContain('Job Board');
    expect(careers!.children!.find((c) => c.label === 'Job Board')?.path).toBe('/jobs');
  });

  it('public menu includes Pay Now', () => {
    const payNow = PUBLIC_MENU.find((i) => i.label === 'Pay Now');
    expect(payNow).toBeDefined();
    expect(payNow!.path).toBe('/payment');
    expect(payNow!.children).toBeUndefined();
  });

  it('authenticated menu items require auth', () => {
    for (const item of AUTHENTICATED_MENU) {
      expect(item.requiresAuth).toBe(true);
    }
  });

  it('admin menu items require administrator persona', () => {
    const checkAdmin = (items: typeof ADMIN_MENU) => {
      for (const item of items) {
        expect(item.requiresAuth).toBe(true);
        expect(item.requiredPersonas).toContain('administrator');
        if (item.children) checkAdmin(item.children as typeof ADMIN_MENU);
      }
    };
    checkAdmin(ADMIN_MENU);
  });
});
