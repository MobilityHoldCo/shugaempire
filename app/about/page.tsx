import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import GlobeScene from '@/components/GlobeScene';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Sugar Empire HoldCo was built around a simple observation: Nigeria doesn\'t just need more vehicles. Nigeria needs better mobility systems.',
};

const values = [
  { num: '01', title: 'Ownership', desc: 'We believe people should have pathways toward owning productive assets.' },
  { num: '02', title: 'Trust', desc: 'Transportation involves people\'s money, time, safety and livelihoods. Trust isn\'t optional.' },
  { num: '03', title: 'Opportunity', desc: 'We want our ecosystem to create opportunities rather than simply provide services.' },
  { num: '04', title: 'Innovation', desc: 'Nigeria\'s mobility challenges require Nigerian solutions supported by modern technology.' },
  { num: '05', title: 'Responsibility', desc: 'Growth should happen responsibly — with our drivers, passengers, investors, communities and environment in mind.' },
  { num: '06', title: 'Excellence', desc: 'We want every interaction with Sugar Empire HoldCo to feel intentional, professional and dependable.' },
];

export default function AboutPage() {
  return (
    <div className="page-fade">
      {/* Hero */}
      <section className="section section--dark" style={{ paddingTop: '10rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />About Us</p>
          <RevealText as="h1" className="heading-xl" style={{ maxWidth: '800px' }}>
            We Believe Mobility Should Create More Than Movement.
          </RevealText>
          <p className="lead" style={{ marginTop: '2rem' }}>
            Sugar Empire HoldCo was built around a simple observation: Nigeria doesn&apos;t just need more vehicles. Nigeria needs better mobility systems.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section section--mid">
        <div className="container">
          <div className="grid-2">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />Our Story</p>
              <RevealText as="h2" className="heading-lg">That&apos;s Sugar Empire HoldCo.</RevealText>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>We see the driver who wants to own a car. We see the investor looking for productive assets. We see the passenger who simply wants a reliable ride. We see the growing demand for electric mobility.</p>
                <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>And we see the infrastructure gap that stands between today&apos;s transportation system and tomorrow&apos;s. Rather than solving these problems separately, we decided to connect them.</p>
                <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1.05rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)' }}>Vehicles. People. Technology. Energy. Opportunity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section section--dark">
        <div className="container">
          <div className="grid-2">
            <div style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <p className="eyebrow"><span className="eyebrow-line" />Our Vision</p>
              <h2 className="heading-md" style={{ marginTop: '1rem' }}>To Build Africa&apos;s Most Connected Mobility Ecosystem.</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginTop: '1.25rem' }}>We envision a Nigeria where access to transportation creates access to opportunity. Where drivers can work toward vehicle ownership. Where investors participate in productive mobility assets. Our long-term ambition extends beyond Nigeria — Africa is where we see the opportunity.</p>
            </div>
            <div style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <p className="eyebrow"><span className="eyebrow-line" />Our Mission</p>
              <h2 className="heading-md" style={{ marginTop: '1rem' }}>To make mobility more accessible, productive and sustainable.</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginTop: '1.25rem' }}>Everything we build should answer one question: Does this make mobility better for people? For the driver. For the passenger. For the investor. For our cities. For the environment. For the future.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Network Visualization */}
      <section className="section section--dark" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-line" />Pan-African Infrastructure<span className="eyebrow-line" /></p>
            <RevealText as="h2" className="heading-lg" style={{ maxWidth: '720px', margin: '0.5rem auto 0' }}>
              Built for Nigeria Today. Engineered for Africa Tomorrow.
            </RevealText>
          </div>
          <GlobeScene />
        </div>
      </section>

      {/* Values */}
      <section className="section section--mid">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />Our Values</p>
            <RevealText as="h2" className="heading-lg">What we stand for.</RevealText>
          </div>
          <div className="steps-grid">
            {values.map(v => (
              <div key={v.num} className="step-item">
                <span className="step-num">{v.num}</span>
                <div className="step-title">{v.title}</div>
                <p className="step-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-line" />Join the Journey<span className="eyebrow-line" /></p>
          <RevealText as="h2" className="heading-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Ready to be part of it?
          </RevealText>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            <Link href="/shuga-cars" className="btn btn--white" data-cursor>Get a Shuga Car</Link>
            <Link href="/contact" className="btn btn--outline" data-cursor>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
