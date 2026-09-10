'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

const links = [
  { href: '/about', label: 'About' },
  { href: '/shuga-cars', label: 'SHUGA FLEET' },
  { href: '/shuga-ride', label: 'Shuga Ride' },
  { href: '/shuga-energy', label: 'Shuga Energy' },
  { href: '/investors', label: 'Investors' },
  { href: '/waitlist', label: 'Waitlist' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Mobility Hold Co. home">
          <Image
            src="/text logo with icon.jpeg"
            alt="Shuga Empire — Mobility Hold Co."
            width={160}
            height={48}
            className={styles.logo}
            priority
          />
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={styles.navLink} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.cta}>
          <Link href="/waitlist" className={styles.ctaWaitlist}>
            <span className={styles.ctaDot} />
            Join Waitlist
          </Link>
          <Link href="/shuga-cars" className={styles.ctaSolid}>Get a Car</Link>
        </div>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
