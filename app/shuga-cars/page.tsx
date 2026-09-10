import type { Metadata } from 'next';
import RevealText from '@/components/RevealText';
import VehicleShowcase3D from '@/components/VehicleShowcase3D';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'SHUGA FLEET',
  description: 'Don\'t just drive a car — own one. SHUGA FLEET gives qualified drivers access to electric vehicles through hire-purchase arrangements.',
};

const steps = [
  { num: '01', title: 'Apply', desc: 'Submit your application and provide the required information.' },
  { num: '02', title: 'Get Approved', desc: 'Our team reviews your application and determines eligibility.' },
  { num: '03', title: 'Make Your Deposit', desc: 'Pay the agreed initial deposit.' },
  { num: '04', title: 'Receive Your Vehicle', desc: 'Once approved, you\'ll receive your assigned vehicle.' },
  { num: '05', title: 'Drive & Earn', desc: 'Use your vehicle for approved ride-hailing operations.' },
  { num: '06', title: 'Charge at Shuga Energy', desc: 'Keep your vehicle powered through our designated charging network.' },
  { num: '07', title: 'Complete the Journey', desc: 'Continue making your fixed daily payments throughout the agreed term.' },
  { num: '08', title: 'Own Your Car', desc: 'Complete the required payments and take ownership.' },
];

export default function ShugaCarsPage() {
  return (
    <div className="page-fade">
      {/* Hero image */}
      <div className={styles.pageHeroImg}>
        <Image src="/shuga-ev-crossover.jpg" alt="SHUGA FLEET luxury electric crossover with custom Shuga branding" fill priority />
        <div className={styles.pageHeroImgOverlay} />
        <span className={styles.pageHeroTag} aria-hidden>SHUGA FLEET</span>
      </div>

      <section className="section section--dark" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <p className="eyebrow"><span className="eyebrow-line" />SHUGA FLEET</p>
          <RevealText as="h1" className="heading-xl">
            A Vehicle Can Change Your Life.
          </RevealText>
          <p className="lead" style={{ marginTop: '2rem' }}>
            For a driver, owning a vehicle can mean independence. Greater control over your income. An asset that belongs to you. SHUGA FLEET is designed to create that pathway.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn--white" data-cursor>Start Your Application</Link>
            <Link href="/shuga-ride" className="btn btn--outline" data-cursor>Also Drive with Shuga Ride</Link>
          </div>
        </div>
      </section>

      {/* Tagline strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center', background: '#0a0a0a' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Deposit &nbsp;→&nbsp; Drive &nbsp;→&nbsp; Pay &nbsp;→&nbsp; Own
        </p>
      </div>

      {/* ── 3D ELECTRIC VEHICLE SHOWROOM ── */}
      <section className="section section--dark" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '2.5rem', paddingTop: '5.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              <span className="eyebrow-line" />Interactive 3D Showroom<span className="eyebrow-line" />
            </p>
            <RevealText as="h2" className="heading-lg" style={{ maxWidth: '820px', margin: '0.5rem auto 0' }}>
              Engineered for Range, Built for Ownership
            </RevealText>
            <p className="lead" style={{ maxWidth: '660px', margin: '1rem auto 0' }}>
              Inspect the Shuga Electric Vehicle fleet in real-time 3D. Aerodynamic composite body, 320 km range, and optimized for Nigerian urban transit.
            </p>
          </div>
        </div>

        <VehicleShowcase3D />
      </section>

      {/* How it works */}
      <section className="section section--mid">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow"><span className="eyebrow-line" />How the Programme Works</p>
            <RevealText as="h2" className="heading-lg">Hire today. Own tomorrow.</RevealText>
          </div>
          <div className={`${styles.driverStepsGrid} skew-on-scroll`}>
            {steps.map(s => (
              <div key={s.num} className={`step-item ${styles.stepCard}`}>
                <span className="step-num">{s.num}</span>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}

            {/* Cinematic EV Delivery Banner filling the remaining slots of row 2 */}
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
                <Link href="/contact" className={styles.driverRewardBtn} data-cursor>
                  Apply for a Vehicle &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Investors */}
      <section className="section section--dark">
        <div className="container">
          <div className="grid-2">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />For Investors</p>
              <RevealText as="h2" className="heading-lg">You own the asset. We help put it to work.</RevealText>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>Investors can acquire vehicles and have them operated by professional drivers while Mobility Hold Co. helps coordinate and manage the operational side — from vehicle deployment to driver management and performance oversight.</p>
                <p style={{ fontFamily: 'var(--font-techno)', fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>Driver Allocation · Vehicle Deployment · Operational Monitoring · Maintenance Coordination</p>
                <Link href="/investors" className="btn btn--outline" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} data-cursor>Learn About Investing</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--mid" style={{ textAlign: 'center' }}>
        <div className="container">
          <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-line" />Ready to Stop Renting Your Future?<span className="eyebrow-line" /></p>
          <RevealText as="h2" className="heading-lg" style={{ maxWidth: '700px', margin: '0 auto' }}>
            Your next car could be more than a vehicle. It could be yours.
          </RevealText>
          <Link href="/contact" className="btn btn--white" style={{ marginTop: '2.5rem' }} data-cursor>Start Your Application</Link>
        </div>
      </section>
    </div>
  );
}
