import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import AppShell from '@/components/layout/AppShell';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = getPublicSiteUrl();

/** Google Business Profile Maps CID — links structured data to the verified listing. */
const GOOGLE_BUSINESS_CID = '10951778937698477327';

const GOOGLE_MAPS_SAME_AS = `https://www.google.com/maps?cid=${GOOGLE_BUSINESS_CID}`;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: 'RoseDale Drive',
  addressLocality: 'Kingston',
  addressCountry: 'JM',
} as const;

const organizationId = `${BASE_URL}#organization`;

const SCHEMA_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Weir Here Staffing Solutions',
      url: BASE_URL,
      logo: `${BASE_URL}/weir-here-logo-transparent.png`,
      email: 'info@weirheresolutions.com',
      telephone: '+18765669428',
      sameAs: [GOOGLE_MAPS_SAME_AS],
      address: { ...postalAddress },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}#localBusiness`,
      name: 'Weir Here Staffing Solutions',
      image: `${BASE_URL}/weir-here-logo-transparent.png`,
      url: BASE_URL,
      telephone: '+18765669428',
      email: 'info@weirheresolutions.com',
      parentOrganization: { '@id': organizationId },
      sameAs: [GOOGLE_MAPS_SAME_AS],
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'GoogleBusinessProfileCID',
        value: GOOGLE_BUSINESS_CID,
      },
      address: { ...postalAddress },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 17.997,
        longitude: -76.7936,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    },
    {
      '@type': 'Person',
      name: 'Carla Brannon',
      jobTitle: 'Chief Executive Officer',
      url: `${BASE_URL}/about/carla`,
      worksFor: { '@id': organizationId },
    },
    {
      '@type': 'Person',
      name: 'Patsy Weir',
      jobTitle: 'Chief Financial Officer',
      url: `${BASE_URL}/about/patsy`,
      worksFor: { '@id': organizationId },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  title: {
    default: 'Weir Here Staffing Solutions | Kingston, Jamaica',
    template: '%s | Weir Here Staffing',
  },
  description:
    'Weir Here Staffing Solutions connects qualified healthcare professionals and domestic workers with employers and families in Kingston, Jamaica and beyond.',
  keywords: [
    'staffing agency Jamaica',
    'healthcare staffing Kingston Jamaica',
    'nursing agency Jamaica',
    'domestic workers Jamaica',
    'registered nurses Jamaica',
    'LPN Jamaica',
    'geriatric nurses Jamaica',
    'babysitter Jamaica',
    'Weir Here Staffing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_JM',
    url: BASE_URL,
    siteName: 'Weir Here Staffing Solutions',
    title: 'Weir Here Staffing Solutions | Kingston, Jamaica',
    description:
      'Connecting qualified healthcare professionals and domestic workers with employers and families across Jamaica.',
    images: [
      {
        url: '/weir-here-logo-transparent.png',
        width: 800,
        height: 600,
        alt: 'Weir Here Staffing Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weir Here Staffing Solutions | Kingston, Jamaica',
    description:
      'Connecting qualified healthcare professionals and domestic workers with employers and families across Jamaica.',
    images: ['/weir-here-logo-transparent.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ldJson = JSON.stringify(SCHEMA_GRAPH);

  return (
    <html lang="en-JM" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* JSON-LD in body (valid for Google); avoids head mutations from browser extensions that cause hydration mismatches. */}
        <script
          id="weir-here-schema-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: ldJson }}
        />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
