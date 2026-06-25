export interface ProviderAddressDetails {
  streetLine1: string;
  streetLine2: string;
  city: string;
  parish: string;
  postalCode: string;
}

export const EMPTY_PROVIDER_ADDRESS: ProviderAddressDetails = {
  streetLine1: '',
  streetLine2: '',
  city: '',
  parish: '',
  postalCode: '',
};

export function hydrateProviderAddressDetails(
  addressDetails: Partial<ProviderAddressDetails> | undefined,
  legacyAddress?: string,
): ProviderAddressDetails {
  const details: ProviderAddressDetails = {
    ...EMPTY_PROVIDER_ADDRESS,
    ...(addressDetails ?? {}),
  };
  const legacy = legacyAddress?.trim() ?? '';
  if (!details.streetLine1.trim() && legacy) {
    details.streetLine1 = legacy;
  }
  return details;
}

export type AddressDetails = ProviderAddressDetails;
export const EMPTY_ADDRESS_DETAILS = EMPTY_PROVIDER_ADDRESS;
export const hydrateAddressDetails = hydrateProviderAddressDetails;
export const formatAddress = formatProviderAddress;

export function formatProviderAddress(
  details: Partial<ProviderAddressDetails> | undefined,
  legacyAddress?: string,
): string {
  const parts = [
    details?.streetLine1?.trim(),
    details?.streetLine2?.trim(),
    [details?.city?.trim(), details?.parish?.trim()].filter(Boolean).join(', '),
    details?.postalCode?.trim(),
  ].filter(Boolean) as string[];

  if (parts.length > 0) return parts.join(', ');
  return legacyAddress?.trim() || '';
}

/** Ensures the home parish from the address is always included. */
export function normalizePreferredParishes(
  homeParish: string | undefined,
  preferred: string[] | undefined,
): string[] {
  const result: string[] = [];
  const add = (value: string | undefined) => {
    const trimmed = value?.trim();
    if (trimmed && !result.includes(trimmed)) result.push(trimmed);
  };

  add(homeParish);
  for (const parish of preferred ?? []) add(parish);
  return result;
}
