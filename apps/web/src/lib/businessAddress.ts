export const BUSINESS_STREET = '7 Rosedale Drive';
export const BUSINESS_CITY = 'Mandeville';
export const BUSINESS_COUNTRY = 'Jamaica';

export const BUSINESS_ADDRESS_LINE = `${BUSINESS_STREET}, ${BUSINESS_CITY}, ${BUSINESS_COUNTRY}`;

export type BusinessLocation = {
  id: string;
  label: string;
  addressLine: string;
  mapsQuery: string;
  note?: string;
  isRegisteredOffice?: boolean;
};

export const BUSINESS_LOCATIONS: BusinessLocation[] = [
  {
    id: 'mandeville',
    label: 'Mandeville',
    addressLine: BUSINESS_ADDRESS_LINE,
    mapsQuery: BUSINESS_ADDRESS_LINE,
    isRegisteredOffice: true,
  },
  {
    id: 'kingston',
    label: 'Kingston',
    addressLine: '1 North Avenue, Kingston (Off Arthur Wint Drive)',
    mapsQuery: '1 North Avenue, Kingston, Jamaica',
    note: 'By appointment only',
  },
  {
    id: 'portland',
    label: 'Port Antonio, Portland',
    addressLine: 'Shop 4-6, West Palm Court, 17 West Palm Avenue, Port Antonio, Portland',
    mapsQuery: '17 West Palm Avenue, Port Antonio, Portland, Jamaica',
    note: 'By appointment only',
  },
];

/** Google Business Profile CID for structured data */
export const GOOGLE_BUSINESS_PROFILE_CID = '9587684291007895327';

export const GOOGLE_BUSINESS_PROFILE_URL =
  `https://www.google.com/maps?cid=${GOOGLE_BUSINESS_PROFILE_CID}`;

/** Opens Google Maps centered on the registered office address */
export const GOOGLE_BUSINESS_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_ADDRESS_LINE)}`;

/** Embedded map pinned to the registered office address */
export const GOOGLE_BUSINESS_MAP_EMBED_URL =
  `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS_ADDRESS_LINE)}&z=17&output=embed`;

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
}

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CQ8lznbU83CYEBM/review';

export const GOOGLE_REVIEW_QR_IMAGE = '/weir-here-google-review-qr.png';

/** Approximate coordinates for Mandeville, Manchester, Jamaica */
export const BUSINESS_GEO = {
  latitude: 18.0417,
  longitude: -77.5072,
} as const;
