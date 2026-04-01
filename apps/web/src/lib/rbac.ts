import {
  Persona,
  IMenuItem,
  hasPermission,
  Permission,
} from '@weir-here/shared';

export function filterMenuForUser(
  items: IMenuItem[],
  personas: Persona[],
  isAuthenticated: boolean
): IMenuItem[] {
  return items.reduce<IMenuItem[]>((acc, item) => {
    if (item.requiresAuth && !isAuthenticated) return acc;

    if (
      item.requiredPersonas &&
      item.requiredPersonas.length > 0 &&
      !item.requiredPersonas.some((rp) => personas.includes(rp))
    ) {
      return acc;
    }

    const filtered: IMenuItem = { ...item };
    if (item.children) {
      const hadChildren = item.children.length > 0;
      filtered.children = filterMenuForUser(item.children, personas, isAuthenticated);
      if (hadChildren && filtered.children.length === 0) {
        return acc;
      }
    }

    acc.push(filtered);
    return acc;
  }, []);
}

export function userHasPermission(
  personas: Persona[],
  permission: Permission
): boolean {
  return hasPermission(personas, permission);
}

export function isAdmin(personas: Persona[]): boolean {
  return personas.includes('administrator');
}
