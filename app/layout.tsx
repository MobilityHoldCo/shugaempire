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
    template: '%s | Sugar Empire HoldCo',
    default: 'Sugar Empire HoldCo | Building the Future of Mobility in Nigeria',
  },
  description:
    'Sugar Empire HoldCo connects vehicle ownership (SHUGA FLEET), ride-hailing (Shuga Ride) and solar-powered EV charging (Shuga Energy) into one Nigerian mobility ecosystem.',
  keywords: [
    'mobility Nigeria',
    'electric vehicles Nigeria',
    'EV charging Nigeria',
    'ride-hailing Nigeria',
    'SHUGA FLEET',
    'Shuga Ride',
    'Shuga Energy',
    'Sugar Empire HoldCo',
    'Sugar Empire',
    'Shuga Empire',
    'ShugaEmpire',
    'solar EV charging',
    'Nigerian mobility ecosystem',
    'buy car Nigeria',
    'EV subscription Nigeria',
  ],
  authors: [{ name: 'Sugar Empire HoldCo', url: BASE_URL }],
  creator: 'Sugar Empire HoldCo',
  publisher: 'Sugar Empire HoldCo',
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
    title: 'Sugar Empire HoldCo | Building the Future of Mobility in Nigeria',
    description:
      'Vehicle ownership, ride-hailing and solar-powered EV charging — one connected mobility ecosystem built for Nigeria.',
    url: BASE_URL,
    siteName: 'Sugar Empire HoldCo',
    type: 'website',
    locale: 'en_NG',
    images: [
      {
        url: '/text logo with icon.jpeg',
        width: 1200,
        height: 630,
        alt: 'Sugar Empire HoldCo — Future of Mobility in Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sugar Empire HoldCo | Building the Future of Mobility in Nigeria',
    description:
      'Vehicle ownership, ride-hailing and solar-powered EV charging — one connected mobility ecosystem built for Nigeria.',
    images: ['/text logo with icon.jpeg'],
    creator: '@shugaempire',
    site: '@shugaempire',
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
    <html lang="en" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #000000 !important;
                color: #ffffff !important;
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                min-height: 100vh;
              }
              a {
                color: inherit;
                text-decoration: none;
              }
              img, video {
                max-width: 100%;
                height: auto;
              }
              button {
                font-family: inherit;
              }
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#000000', color: '#ffffff', margin: 0, minHeight: '100vh' }}>
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
