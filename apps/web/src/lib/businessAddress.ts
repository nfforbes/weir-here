export const BUSINESS_STREET = '7 Rosedale Drive';
export const BUSINESS_CITY = 'Mandeville';
export const BUSINESS_COUNTRY = 'Jamaica';

export const BUSINESS_ADDRESS_LINE = `${BUSINESS_STREET}, ${BUSINESS_CITY}, ${BUSINESS_COUNTRY}`;

export type BusinessLocation = {
  id: string;
  label: string;
  addressLine: string;
  mapsQuery: string;
  /** Prefer this URL when set (e.g. Google Business place link) */
  mapsUrl?: string;
  /** Query/coords for the embedded map iframe (defaults to mapsQuery) */
  mapsEmbedQuery?: string;
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
    mapsUrl:
      'https://www.google.com/maps/place/Weir+Here+Staffing+Solutions/@18.0017496,-76.7778057,17z/data=!3m1!4b1!4m6!3m5!1s0x8edb3f0005232275:0xd0d18010e0aadbc3!8m2!3d18.0017496!4d-76.7778057!16s%2Fg%2F11zx15blpl?hl=en',
    mapsEmbedQuery: '18.0017496,-76.7778057',
    note: 'By appointment only',
  },
  {
    id: 'portland',
    label: 'Port Antonio, Portland',
    addressLine: 'Shop 4-6, West Palm Court, 17 West Palm Avenue, Port Antonio, Portland',
    mapsQuery: '17 West Palm Avenue, Port Antonio, Portland, Jamaica',
    mapsUrl:
      'https://www.google.com/maps/place/shop+%237,+17+W+Palm+Ave,+Port+Antonio/@18.1794006,-76.4623512,17z/data=!3m1!4b1!4m10!1m2!2m1!1sshop+4-6+West+palm+court+17+west+palm+avenue+Port+Antonio!3m6!1s0x8edb2d2a5d7d8065:0x5f43414ab56c6a21!8m2!3d18.1794006!4d-76.4597763!15sCjlzaG9wIDQtNiBXZXN0IHBhbG0gY291cnQgMTcgd2VzdCBwYWxtIGF2ZW51ZSBQb3J0IEFudG9uaW-SAQpzdWJwcmVtaXNl4AEA!16s%2Fg%2F11s598l6kn',
    mapsEmbedQuery: '18.1794006,-76.4597763',
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
