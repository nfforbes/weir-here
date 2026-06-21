interface PhoneNumber {
  number: string;
  isBest?: boolean;
}

interface QualificationLike {
  fileName: string;
  description?: string;
}

export interface ClientListItem {
  name: string;
  address: string;
  phoneNumbers?: PhoneNumber[];
}

export interface ProviderListItem {
  name: string;
  email?: string;
  address: string;
  phoneNumbers?: PhoneNumber[];
  qualifications: QualificationLike[];
}

function containsQuery(text: string | undefined, query: string): boolean {
  return text?.toLowerCase().includes(query) ?? false;
}

export function filterClients<T extends ClientListItem>(clients: T[], search: string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return clients;
  return clients.filter(
    (c) =>
      containsQuery(c.name, query) ||
      containsQuery(c.address, query) ||
      (c.phoneNumbers?.some((p) => containsQuery(p.number, query)) ?? false),
  );
}

export function filterProviders<T extends ProviderListItem>(providers: T[], search: string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return providers;
  return providers.filter(
    (p) =>
      containsQuery(p.name, query) ||
      containsQuery(p.email, query) ||
      containsQuery(p.address, query) ||
      (p.phoneNumbers?.some((ph) => containsQuery(ph.number, query)) ?? false) ||
      p.qualifications.some(
        (q) => containsQuery(q.description, query) || containsQuery(q.fileName, query),
      ),
  );
}

export function paginateList<T>(items: T[], page: number, rowsPerPage: number): T[] {
  const start = page * rowsPerPage;
  return items.slice(start, start + rowsPerPage);
}
