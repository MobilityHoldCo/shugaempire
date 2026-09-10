import type { Metadata } from 'next';
import WaitlistSection from '@/components/WaitlistSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Join the Early Access Waitlist | Shuga Empire',
  description:
    'Reserve your spot in Nigeria\'s most anticipated electric mobility ecosystem. Priority EV vehicle allocation for drivers, exclusive ride discounts, and fleet investment opportunities.',
};

export default function WaitlistPage() {
  return (
    <div className="page-fade" style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <WaitlistSection id="main-waitlist" />

      <div style={{ textAlign: 'center', padding: '2rem 1rem 4rem' }}>
        <Link href="/" className="btn btn--outline" style={{ fontSize: '0.82rem', letterSpacing: '0.08em' }}>
          &larr; Return to Homepage
        </Link>
      </div>
    </div>
  );
}
