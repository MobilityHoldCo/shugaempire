import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about SHUGA Empire HoldCo, SHUGA FLEET, Shuga Ride, and Shuga Energy.',
};

const faqs = [
  {
    category: 'SHUGA FLEET',
    items: [
      { q: 'What is SHUGA FLEET?', a: 'SHUGA FLEET is our vehicle drive-to-own programme. Qualified drivers can access an electric vehicle by paying an agreed deposit and making fixed daily payments, working toward full ownership over the agreed term.' },
      { q: 'How do I apply for a Shuga Car?', a: 'You can apply by contacting our team through the contact page. We\'ll guide you through the qualification and onboarding process.' },
      { q: 'How long does it take to own the car?', a: 'The ownership period depends on the agreement terms set at the start of the programme. Our team will outline the full terms when you apply.' },
      { q: 'Can investors own vehicles and have them operated?', a: 'Yes. Investors can acquire vehicles and have them operated by professional drivers through our programme, with SHUGA Empire HoldCo coordinating the operational side.' },
    ],
  },
  {
    category: 'Shuga Ride',
    items: [
      { q: 'Where is Shuga Ride currently available?', a: 'Shuga Ride is currently live in Lagos and Abuja, with plans to expand to more major Nigerian cities.' },
      { q: 'How do I book a ride?', a: 'You can book through the Shuga Ride app. Contact our team for access and download details.' },
      { q: 'Can I drive for Shuga Ride?', a: 'Yes. Drivers who have been onboarded through the SHUGA FLEET programme can operate through Shuga Ride. Contact our team to learn more.' },
    ],
  },
  {
    category: 'Shuga Energy',
    items: [
      { q: 'What is Shuga Energy?', a: 'Shuga Energy is our solar-powered EV charging infrastructure. We operate charging hubs for Shuga drivers and for the wider public with any EV.' },
      { q: 'Can non-Shuga drivers use the charging hubs?', a: 'Yes. Our charging network is open to the public — any EV, any operator can access our hubs.' },
      { q: 'Are the hubs solar-powered?', a: 'Yes. Our hubs are designed to leverage solar energy to provide more sustainable, reliable charging infrastructure.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="page-fade">
      <section className="section section--dark" style={{ paddingTop: '10rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />FAQ</p>
          <RevealText as="h1" className="heading-xl">Got Questions?</RevealText>
          <p className="lead" style={{ marginTop: '1.5rem' }}>
            Everything you need to know about SHUGA Empire HoldCo, SHUGA FLEET, Shuga Ride, and Shuga Energy.
          </p>
        </div>
      </section>

      <section className="section section--mid">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {faqs.map(section => (
              <div key={section.category}>
                <p className="eyebrow" style={{ marginBottom: '2rem' }}><span className="eyebrow-line" />{section.category}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {section.items.map((item, i) => (
                    <details key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem 0' }}>
                      <summary style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.q}
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>+</span>
                      </summary>
                      <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginTop: '1rem', maxWidth: '640px' }}>{item.a}</p>
                    </details>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '5rem', textAlign: 'center', padding: '4rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', background: 'rgba(255,255,255,0.01)' }}>
            <RevealText as="h2" className="heading-md">Still have questions?</RevealText>
            <p className="lead" style={{ margin: '1rem auto', textAlign: 'center' }}>Our team is happy to help. Reach out and we&apos;ll get back to you.</p>
            <Link href="/contact" className="btn btn--white" style={{ marginTop: '1.5rem' }} data-cursor>Contact Our Team</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
