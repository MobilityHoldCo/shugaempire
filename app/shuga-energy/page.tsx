import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import EnergyHubScene3D from '@/components/EnergyHubScene3D';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Shuga Energy',
  description: 'Powering the journey beyond the grid. Solar-powered EV charging infrastructure for Nigeria\'s electric mobility future.',
};

export default function ShugaEnergyPage() {
  return (
    <div className="page-fade">
      {/* Hero image — charging hub row */}
      <div style={{ position: 'relative', width: '100%', height: '60vh', overflow: 'hidden', marginTop: '5rem' }}>
        <Image src="/charging-hub-row.png" alt="Row of solar-powered EV charging stations — Shuga Energy" fill priority style={{ objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(10%) contrast(1.05)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.92) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', fontFamily: 'var(--font-techno)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.5rem 1rem', backdropFilter: 'blur(8px)' }}>Solar-Powered</div>
      </div>

      <section className="section section--dark" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />Shuga Energy</p>
          <RevealText as="h1" className="heading-xl">Energy for a Moving Nigeria.</RevealText>
          <p className="lead" style={{ marginTop: '2rem' }}>
            Electric vehicles cannot transform transportation without reliable charging infrastructure. Shuga Energy exists to build that infrastructure. Where vehicles move, energy must follow.
          </p>
        </div>
      </section>

      {/* Tagline */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center', background: '#0a0a0a' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Solar-Powered &nbsp;·&nbsp; Always On &nbsp;·&nbsp; Open to All
        </p>
      </div>

      {/* ── 3D SOLAR CHARGING SUPERHUB & MICROGRID ── */}
      <section className="section section--dark" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '2.5rem', paddingTop: '5.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              <span className="eyebrow-line" />Solar Microgrid Infrastructure<span className="eyebrow-line" />
            </p>
            <RevealText as="h2" className="heading-lg" style={{ maxWidth: '840px', margin: '0.5rem auto 0' }}>
              Independent Clean Energy. Zero Grid Brownouts.
            </RevealText>
            <p className="lead" style={{ maxWidth: '680px', margin: '1rem auto 0' }}>
              Explore the 3D digital twin of a Shuga Energy Solar Superhub. High-power DC fast-charging bays with live vehicle charging, active energy pulse cables, and off-grid BESS lithium storage.
            </p>
          </div>
        </div>

        <EnergyHubScene3D />
      </section>

      {/* For Drivers */}
      <section className="section section--mid">
        <div className="container">
          <div className="grid-2">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />For Shuga Drivers</p>
              <RevealText as="h2" className="heading-lg">One network. One ecosystem. Less uncertainty.</RevealText>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginTop: '1rem' }}>Your vehicle needs to work. We understand that. That&apos;s why charging is integrated into the Shuga ecosystem. Drivers can access our designated charging hubs under the programme&apos;s agreed charging arrangement. No surprises. No uncertainty. Just reliable power to keep you moving.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Public */}
      <section className="section section--dark">
        <div className="container">
          <div className="grid-2">
            <div style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className="eyebrow"><span className="eyebrow-line" />For the Public</p>
              <h2 className="heading-md">Charge your vehicle. Continue your journey.</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>You don&apos;t have to drive a Shuga vehicle to use Shuga Energy. Our charging infrastructure is designed to serve EV owners and commercial operators who need dependable charging access. Any EV. Any operator.</p>
              <Link href="/contact" className="btn btn--outline" style={{ alignSelf: 'flex-start' }} data-cursor>Find a Charging Hub</Link>
            </div>
            <div style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <p className="eyebrow"><span className="eyebrow-line" />Infrastructure</p>
              <h2 className="heading-md">Built on Solar. Ready for Tomorrow.</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>Our charging hubs leverage solar-powered energy infrastructure to support a more sustainable mobility ecosystem — reducing dependence on the grid and building resilience into our operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--mid" style={{ textAlign: 'center' }}>
        <div className="container">
          <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-line" />Charge Today. Move Tomorrow.<span className="eyebrow-line" /></p>
          <RevealText as="h2" className="heading-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Join Nigeria&apos;s electric mobility future.
          </RevealText>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            <Link href="/contact" className="btn btn--white" data-cursor>Get in Touch</Link>
            <Link href="/shuga-cars" className="btn btn--outline" data-cursor>Get an EV</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
