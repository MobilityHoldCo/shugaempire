import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Sugar Empire HoldCo. Whether you\'re a driver, investor, or passenger — we\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <div className="page-fade">
      <section className="section section--dark" style={{ paddingTop: '10rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />Contact</p>
          <RevealText as="h1" className="heading-xl">Let&apos;s Talk Mobility.</RevealText>
          <p className="lead" style={{ marginTop: '1.5rem' }}>
            Whether you&apos;re a driver looking for your first car, an investor ready to deploy capital, or a passenger who wants to ride — we&apos;re here for you.
          </p>
        </div>
      </section>

      <section className="section section--mid">
        <div className="container">
          <div className="grid-2" style={{ gap: '5rem', alignItems: 'start' }}>
            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {[
                { label: 'For Drivers', value: 'Apply for SHUGA FLEET or join Shuga Ride', action: 'shuga-cars', cta: 'Apply Now →' },
                { label: 'For Investors', value: 'Acquire vehicles. Participate in Nigeria\'s mobility economy.', action: 'investors', cta: 'Learn More →' },
                { label: 'For Passengers', value: 'Book a Shuga Ride in Lagos or Abuja.', action: 'shuga-ride', cta: 'Ride Now →' },
                { label: 'General Enquiries', value: 'Lagos & Abuja, Nigeria', action: null, cta: null },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{item.label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.value}</p>
                  {item.action && <Link href={`/${item.action}`} style={{ fontFamily: 'var(--font-techno)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{item.cta}</Link>}
                </div>
              ))}
            </div>

            {/* Dynamic Interactive Contact form connected to Admin */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
