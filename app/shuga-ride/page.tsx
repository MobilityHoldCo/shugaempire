import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import RideDispatchScene3D from '@/components/RideDispatchScene3D';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shuga Ride',
  description: 'Move with confidence. A ride-hailing experience built for Nigeria — safety, reliability, accessibility and convenience.',
};

const features = [
  { title: 'Convenience', desc: 'Book when you need to move.' },
  { title: 'Safety', desc: 'We take driver and passenger safety seriously.' },
  { title: 'Reliability', desc: 'We want you to know what to expect, every time.' },
  { title: 'Accessibility', desc: 'Mobility should be available to the people who need it.' },
  { title: 'Technology', desc: 'Your ride should feel as modern as the city you\'re moving through.' },
  { title: 'Nationwide Vision', desc: 'Lagos & Abuja today. Every major Nigerian city tomorrow.' },
];

export default function ShugaRidePage() {
  return (
    <div className="page-fade">
      <section className="section section--dark" style={{ paddingTop: '10rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />Shuga Ride</p>
          <RevealText as="h1" className="heading-xl">Move With Confidence.</RevealText>
          <p className="lead" style={{ marginTop: '2rem' }}>
            A ride-hailing experience built for Nigeria. We&apos;re combining technology, professional driver operations and an expanding electric vehicle network to create a smarter way to move.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <Link href="/contact" className="btn btn--white" data-cursor>Book a Ride</Link>
            <Link href="/shuga-cars" className="btn btn--outline" data-cursor>Become a Driver</Link>
          </div>
        </div>
      </section>

      {/* Cities */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2rem', background: '#0a0a0a' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Currently Live In</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', letterSpacing: '0.05em' }}>LAGOS &amp; ABUJA</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Our Vision</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>EVERY MAJOR CITY</p>
          </div>
        </div>
      </div>

      {/* ── 3D LIVE FLEET DISPATCH MATRIX ── */}
      <section className="section section--dark" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '2.5rem', paddingTop: '5.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              <span className="eyebrow-line" />Real-Time Urban Dispatch Grid<span className="eyebrow-line" />
            </p>
            <RevealText as="h2" className="heading-lg" style={{ maxWidth: '840px', margin: '0.5rem auto 0' }}>
              Live Fleet Intelligence Across Nigeria
            </RevealText>
            <p className="lead" style={{ maxWidth: '680px', margin: '1rem auto 0' }}>
              Experience the 3D telemetry of Shuga Ride operations. Monitor active EV cruisers, dynamic pickup routing, and zero-emission transit across Lagos and Abuja.
            </p>
          </div>
        </div>

        <RideDispatchScene3D />
      </section>

      {/* For Passengers */}
      <section className="section section--mid">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />For Passengers</p>
            <RevealText as="h2" className="heading-lg">Your destination is our responsibility.</RevealText>
            <p className="lead" style={{ marginTop: '1rem' }}>
              A ride is never just a ride. Sometimes it&apos;s a job interview. A hospital appointment. A flight. A date. A trip home. We understand every journey has a reason behind it.
            </p>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Drivers */}
      <section className="section section--dark">
        <div className="container">
          <div className="grid-2">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />For Drivers</p>
              <RevealText as="h2" className="heading-lg">Drive With Shuga. Build With Shuga.</RevealText>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginTop: '1rem' }}>We&apos;re not just looking for drivers. We&apos;re looking for people who want to build something. Whether you&apos;re joining our vehicle ownership programme or operating your own approved vehicle, Shuga Ride provides an opportunity to participate in a growing mobility ecosystem.</p>
              <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem' }}>Your journey as a driver can become bigger than today&apos;s trip.</p>
              <Link href="/shuga-cars" className="btn btn--white" style={{ marginTop: '2rem' }} data-cursor>Join SHUGA FLEET First</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
