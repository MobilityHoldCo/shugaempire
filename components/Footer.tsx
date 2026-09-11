import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const cols = [
  {
    title: 'Our Businesses',
    links: [
      { label: 'SHUGA FLEET', href: '/shuga-cars' },
      { label: 'Shuga Ride', href: '/shuga-ride' },
      { label: 'Shuga Energy', href: '/shuga-energy' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Investors', href: '/investors' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { label: 'Contact Team', href: '/contact' },
      { label: 'Apply for a Car', href: '/shuga-cars' },
      { label: 'Become a Driver', href: '/shuga-ride' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Image
              src="/text logo with icon.jpeg"
              alt="Sugar Empire HoldCo"
              width={180}
              height={54}
              style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
            />
          </div>
          <div>
            <div className={styles.brandName}>SUGAR EMPIRE HOLDCO</div>
            <p className={styles.brandTagline}>
              Building Nigeria&apos;s most connected mobility ecosystem. One vehicle. One ride. One charge at a time.
            </p>
          </div>
        </div>

        <div className={styles.cols}>
          {cols.map(col => (
            <div key={col.title} className={styles.col}>
              <h5 className={styles.colTitle}>{col.title}</h5>
              <ul className={styles.colList}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.colLink}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copyright}>© 2026 Sugar Empire HoldCo. All rights reserved.</span>
          <span className={styles.location}>Lagos & Abuja, Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
