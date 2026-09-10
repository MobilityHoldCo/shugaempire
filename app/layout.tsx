import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CursorFollower from '@/components/CursorFollower';
import ScrollProgress from '@/components/ScrollProgress';
import SmoothScroll from '@/components/SmoothScroll';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shugaempire.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | Mobility Hold Co.',
    default: 'Mobility Hold Co. | Building the Future of Mobility in Nigeria',
  },
  description:
    'Mobility Hold Co. connects vehicle ownership (SHUGA FLEET), ride-hailing (Shuga Ride) and solar-powered EV charging (Shuga Energy) into one Nigerian mobility ecosystem.',
  keywords: [
    'mobility Nigeria',
    'electric vehicles Nigeria',
    'EV charging Nigeria',
    'ride-hailing Nigeria',
    'SHUGA FLEET',
    'Shuga Ride',
    'Shuga Energy',
    'Mobility Hold Co',
    'MobilityCo',
    'solar EV charging',
    'Nigerian mobility ecosystem',
    'buy car Nigeria',
    'EV subscription Nigeria',
  ],
  authors: [{ name: 'Mobility Hold Co.', url: BASE_URL }],
  creator: 'Mobility Hold Co.',
  publisher: 'Mobility Hold Co.',
  category: 'Technology',
  classification: 'Mobility / Transportation / Electric Vehicles',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Mobility Hold Co. | Building the Future of Mobility in Nigeria',
    description:
      'Vehicle ownership, ride-hailing and solar-powered EV charging — one connected mobility ecosystem built for Nigeria.',
    url: BASE_URL,
    siteName: 'Mobility Hold Co.',
    type: 'website',
    locale: 'en_NG',
    images: [
      {
        url: '/text logo with icon.jpeg',
        width: 1200,
        height: 630,
        alt: 'Mobility Hold Co. — Future of Mobility in Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobility Hold Co. | Building the Future of Mobility in Nigeria',
    description:
      'Vehicle ownership, ride-hailing and solar-powered EV charging — one connected mobility ecosystem built for Nigeria.',
    images: ['/text logo with icon.jpeg'],
    creator: '@mobilityco_ng',
    site: '@mobilityco_ng',
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // Add your Google Search Console / Bing verification tokens here when ready
    // google: 'YOUR_GOOGLE_VERIFICATION_TOKEN',
    // bing: 'YOUR_BING_VERIFICATION_TOKEN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        <CursorFollower />
        <ScrollProgress />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
