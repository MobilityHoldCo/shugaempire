import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Investors',
  description: 'Invest in mobility. Build with us. Nigeria\'s transportation economy represents a significant opportunity.',
};

const steps = [
  { num: '01', title: 'Acquire', desc: 'Invest in an eligible vehicle through our vehicle ownership programme.' },
  { num: '02', title: 'Deploy', desc: 'The vehicle is assigned for commercial operation.' },
  { num: '03', title: 'Operate', desc: 'A qualified driver operates the vehicle.' },
  { num: '04', title: 'Manage', desc: 'Mobility Hold Co. supports the operational ecosystem.' },
  { num: '05', title: 'Earn', desc: 'Receive payouts according to the agreed investment and management structure.' },
  { num: '06', title: 'Monitor', desc: 'Stay informed about vehicle and operational performance.' },
];

export default function InvestorsPage() {
  return (
    <div className="page-fade">
      <section className="section section--dark" style={{ paddingTop: '10rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />For Investors</p>
          <RevealText as="h1" className="heading-xl">Invest in Mobility. Build With Us.</RevealText>
          <p className="lead" style={{ marginTop: '2rem' }}>
            Nigeria&apos;s transportation economy represents a significant opportunity. Every day, millions of journeys take place. Every journey requires a vehicle. And every vehicle represents an asset.
          </p>
          <Link href="/contact" className="btn btn--white" style={{ marginTop: '2.5rem' }} data-cursor>Speak With Our Investment Team</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="section section--mid">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />How It Works</p>
            <RevealText as="h2" className="heading-lg">Own the asset. Let mobility create the opportunity.</RevealText>
          </div>
          <div className="steps-grid">
            {steps.map(s => (
              <div key={s.num} className="step-item">
                <span className="step-num">{s.num}</span>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent message */}
      <section className="section section--dark">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-line" />We Don&apos;t Sell Dreams<span className="eyebrow-line" /></p>
            <RevealText as="h2" className="heading-lg">We Build Systems.</RevealText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', textAlign: 'left', maxWidth: '600px', margin: '2rem auto 0' }}>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>Vehicle investment comes with risks. Operational performance can vary. Maintenance costs exist. Drivers matter. Market conditions change. That is why our approach is built around structured operations rather than unrealistic promises.</p>
              <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>Serious investors deserve transparency. We are committed to providing it.</p>
            </div>
            <Link href="/contact" className="btn btn--white" style={{ marginTop: '2.5rem' }} data-cursor>Become a Vehicle Investor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
