import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Mobility Hold Co. Whether you\'re a driver, investor, or passenger — we\'d love to hear from you.',
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

            {/* Contact form */}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+234 000 000 0000' },
              ].map(field => (
                <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor={field.id} style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{field.label}</label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', padding: '0.875rem 1rem', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none', width: '100%' }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="interest" style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>I am a…</label>
                <select id="interest" name="interest" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', padding: '0.875rem 1rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none', width: '100%' }}>
                  <option value="driver">Driver — I want a Shuga Car</option>
                  <option value="investor">Investor — I want to acquire a vehicle</option>
                  <option value="passenger">Passenger — I want to ride</option>
                  <option value="other">Other enquiry</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="message" style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us more..."
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', padding: '0.875rem 1rem', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none', width: '100%', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn--white" style={{ alignSelf: 'flex-start' }} data-cursor>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
