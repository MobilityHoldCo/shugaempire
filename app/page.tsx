import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import ImageShowcase from '@/components/ImageShowcase';
import ElectricBanner from '@/components/ElectricBanner';
import SplitImageSection from '@/components/SplitImageSection';
import EcosystemFlow from '@/components/EcosystemFlow';
import RevealText from '@/components/RevealText';
import RoadScene from '@/components/RoadScene';
import GlobeScene from '@/components/GlobeScene';
import WaitlistSection from '@/components/WaitlistSection';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mobility Hold Co. | Building the Future of Mobility in Nigeria',
  description:
    "Nigeria's most connected mobility ecosystem. Vehicle ownership, ride-hailing and solar-powered EV charging — all in one place.",
};

const steps = [
  { num: '01', title: 'Apply', desc: 'Tell us about yourself and your driving goals.' },
  { num: '02', title: 'Get Approved', desc: 'Complete our qualification and onboarding process.' },
  { num: '03', title: 'Pay Deposit', desc: 'Make the required initial contribution.' },
  { num: '04', title: 'Get Vehicle', desc: 'Get assigned an approved electric vehicle.' },
  { num: '05', title: 'Drive & Earn', desc: 'Operate through the Shuga mobility ecosystem.' },
  { num: '06', title: 'Daily Payments', desc: 'Keep to your agreed fixed daily payment.' },
  { num: '07', title: 'Become an Owner', desc: 'Complete the term and take ownership.' },
];

const impacts = [
  { title: 'Income', body: 'When a driver gets access to a vehicle, there is an opportunity for income.' },
  { title: 'Asset Creation', body: 'When that driver works toward ownership, there is an opportunity to build a real asset.' },
  { title: 'Wealth Creation', body: 'When an investor puts a vehicle into productive operation, there is an opportunity for returns.' },
  { title: 'Energy Innovation', body: 'When an EV charges through solar infrastructure, there is a chance to rethink how mobility consumes energy.' },
];

export default function HomePage() {
  return (
    <div className="page-fade">

      {/* ══════════════════════════════════════════
          01 — CINEMATIC HERO (video background)
      ══════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════
          02 — SPLIT: EV HOME-CHARGE IMAGE + TEXT
          "A Different Way to Move"
      ══════════════════════════════════════════ */}
      <SplitImageSection
        imageSrc="/ev-home-charge.png"
        imageAlt="Sleek white electric vehicle charging outside a modern building — SHUGA FLEET"
        eyebrow="A Different Way to Move"
        heading={
          <RevealText as="h2" className="heading-lg">
            What if getting around could also help you get ahead?
          </RevealText>
        }
        body={
          <>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              For millions of Nigerians, a vehicle is more than transportation. It can be a source of income. A business. An investment. The first major asset someone owns.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              Mobility Hold Co. connects the pieces — providing vehicles through structured hire-purchase arrangements, opening investment opportunities, operating a ride-hailing platform, and developing solar-powered charging infrastructure.
            </p>
            <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)', marginTop: '0.5rem' }}>
              One ecosystem. Multiple opportunities. One bigger purpose.
            </p>
          </>
        }
      />

      {/* ══════════════════════════════════════════
          03 — IMAGE SHOWCASE: 3 cards with images
      ══════════════════════════════════════════ */}
      <ImageShowcase />

      {/* ══════════════════════════════════════════
          04 — ECOSYSTEM FLOW
      ══════════════════════════════════════════ */}
      <section className="section section--mid">
        <div className="container">
          <div className={`grid-2 ${styles.ecoGrid}`}>
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />The Ecosystem</p>
              <RevealText as="h2" className="heading-lg">Three services. One connected system.</RevealText>
              <p className="lead" style={{ marginTop: '1.5rem' }}>
                A driver needs a vehicle. The vehicle needs energy. The driver needs passengers. The passenger needs transportation. The ecosystem works when every piece works together.
              </p>
            </div>
            <EcosystemFlow />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          05 — FULL-BLEED PARALLAX: CHARGING HUB
          "Why Electric?"
      ══════════════════════════════════════════ */}
      <ElectricBanner />

      {/* ══════════════════════════════════════════
          05B — THREE.JS: INFINITE 3D HIGHWAY
          Electrified autonomous driving corridor
      ══════════════════════════════════════════ */}
      <RoadScene />

      {/* ══════════════════════════════════════════
          06 — FOR DRIVERS (steps grid)
      ══════════════════════════════════════════ */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />For Drivers</p>
            <RevealText as="h2" className="heading-lg">Your car. Your work. Your future.</RevealText>
            <p className="lead" style={{ marginTop: '1rem' }}>
              We understand what driving means to you — the early mornings, the traffic, the hours in service of passengers. SHUGA FLEET is designed to turn that work into ownership.
            </p>
          </div>
          <div className={`${styles.driverStepsGrid} skew-on-scroll`}>
            {steps.map(s => (
              <div key={s.num} className={`step-item ${s.num === '07' ? styles.stepOwnerCard : ''}`}>
                <span className="step-num">{s.num}</span>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}

            {/* Cinematic EV Delivery Banner filling the remaining slots */}
            <div className={styles.driverRewardBanner}>
              <Image
                src="/shuga-ownership-ev.jpg"
                alt="Shuga Luxury Electric Vehicle Delivery"
                fill
                sizes="(max-width: 768px) 100vw, 75vw"
                className={styles.driverRewardImage}
              />
              <div className={styles.driverRewardOverlay} />
              <div className={styles.driverRewardContent}>
                <p className={styles.driverRewardEyebrow}>The Destination &bull; 100% Ownership</p>
                <h3 className={styles.driverRewardTitle}>Your Hard Work Turns Into A Debt-Free Electric Asset</h3>
                <p className={styles.driverRewardDesc}>
                  Complete the agreed lease-to-own period with steady daily payments, zero petrol expense, and solar charging credits.
                </p>
                <Link href="/shuga-cars" className={styles.driverRewardBtn} data-cursor>
                  Apply for a Vehicle &rarr;
                </Link>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <Link href="/shuga-cars" className="btn btn--white" data-cursor>Apply for a Shuga Car</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          07 — SPLIT: EV FLEET IMAGE + INVESTOR TEXT
          "For Investors"
      ══════════════════════════════════════════ */}
      <SplitImageSection
        imageSrc="/ev-fleet-charging.png"
        imageAlt="Fleet of electric vehicles at charging stations — SHUGA FLEET investor programme"
        eyebrow="For Investors"
        reverse
        heading={
          <RevealText as="h2" className="heading-lg">
            Turn vehicles into productive assets.
          </RevealText>
        }
        body={
          <>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              You don&apos;t have to be the driver to participate. Investors can acquire vehicles and have them operated by professional drivers while Mobility Hold Co. coordinates and manages the operational side.
            </p>
            <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)' }}>
              You own the asset. We help put it to work.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/investors" className="btn btn--outline" data-cursor>Speak with Our Investment Team</Link>
            </div>
          </>
        }
      />

      {/* ══════════════════════════════════════════
          07B — THREE.JS: PAN-NIGERIA 3D GLOBE NETWORK
      ══════════════════════════════════════════ */}
      <section className="section section--mid" style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />Interactive 3D Network</p>
              <RevealText as="h2" className="heading-lg">
                Connecting Nigeria&apos;s Economic Powerhouses
              </RevealText>
              <p className="lead" style={{ marginTop: '1.25rem' }}>
                From the commercial energy of Lagos to the governance nexus of Abuja, extending to Kano, Ibadan, and Port Harcourt. Our smart EV corridors bridge Nigeria&apos;s key transit routes.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff' }}>2</div>
                  <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>PRIMARY HUBS (LAGOS &amp; ABUJA)</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff' }}>3</div>
                  <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>EXPANSION ZONES</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff' }}>100%</div>
                  <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>SOLAR-INTEGRATED</div>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-techno)', fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)', marginTop: '2rem' }}>
                [ 3D NIGERIA MAP // DRAG TO TILT &bull; SCROLL TO ZOOM &bull; CLICK CITIES ]
              </p>
            </div>
            <div>
              <GlobeScene />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          08 — OUR IMPACT
      ══════════════════════════════════════════ */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />Our Impact</p>
            <RevealText as="h2" className="heading-lg">
              We don&apos;t want to simply move Nigeria. We want to help Nigeria move forward.
            </RevealText>
          </div>
          <div className="impact-list skew-on-scroll">
            {impacts.map(imp => (
              <div key={imp.title} className="impact-row">
                <strong>{imp.title}</strong>
                <p>{imp.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          08B — JOIN THE WAITLIST
      ══════════════════════════════════════════ */}
      <WaitlistSection id="waitlist" />

      {/* ══════════════════════════════════════════
          09 — FINAL CTA BANNER
      ══════════════════════════════════════════ */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" />Nigeria Is Moving<span className="eyebrow-line" />
          </p>
          <RevealText as="h2" className={`heading-xl ${styles.ctaHeading}`}>
            The question isn&apos;t whether mobility will change. It will. The question is who will build what comes next.
          </RevealText>
          <p className="lead" style={{ margin: '2rem auto', textAlign: 'center' }}>
            Move. Earn. Own. Power. — this is mobility with a purpose.
          </p>
          <Link href="/contact" className="btn btn--white" data-cursor>Get Started</Link>
        </div>
      </section>

    </div>
  );
}
