import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import AppShell from '@/components/layout/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const FALLBACK_SITE_URL = 'https://weirheresolutions.com';

function resolveAbsoluteSiteUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return FALLBACK_SITE_URL;
  try {
    return new URL(trimmed).toString().replace(/\/$/, '');
  } catch {
    console.warn(
      '[layout] Invalid APP_BASE_URL; using fallback. Set a full URL like https://localhost:3000',
    );
    return FALLBACK_SITE_URL;
  }
}

const BASE_URL = resolveAbsoluteSiteUrl(process.env.APP_BASE_URL);

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Weir Here Staffing Solutions',
  url: BASE_URL,
  telephone: '+18762879632',
  email: 'info@weirheresolutions.com',
  image: `${BASE_URL}/weir-here-logo-transparent.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'RoseDale Drive',
    addressLocality: 'Kingston',
    addressCountry: 'JM',
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ldJson = JSON.stringify(LOCAL_BUSINESS_SCHEMA);

  return (
    <html lang="en-JM" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* JSON-LD in body (valid for Google); avoids head mutations from browser extensions that cause hydration mismatches. */}
        <script
          id="weir-here-local-business-jsonld"
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
