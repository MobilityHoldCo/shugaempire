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
    <div className="page-fade" style={{ paddingTop: '5rem' }}>
      <WaitlistSection id="main-waitlist" />

      {/* Quick FAQ Strip */}
      <section className="section section--dark" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" />Frequently Asked Questions<span className="eyebrow-line" />
          </p>

          <div style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                When will vehicles be available in my city?
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Rollout begins in Lagos and Abuja in Q4, followed by expansion into Port Harcourt and Ibadan. Waitlist members receive priority invitation codes based on registration date.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                What are the requirements for drivers?
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                A valid Nigerian driver&apos;s license, minimum 21 years of age, verified residential address, and clean driving history. Commercial driving experience (Uber, Bolt, etc.) gives you accelerated approval.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                How do fleet investors participate?
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Investors can acquire individual vehicles or syndicates that are placed into our managed ecosystem with vetted drivers, solar charging, maintenance, and insurance handled by Shuga Empire.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/" className="btn btn--outline" style={{ fontSize: '0.85rem' }}>
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
