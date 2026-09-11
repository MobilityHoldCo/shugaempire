'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

const desktopLinks = [
  { href: '/about', label: 'About', num: '01' },
  { href: '/waitlist', label: 'Waitlist', num: '06' },
  { href: '/faq', label: 'FAQ', num: '07' },
  { href: '/contact', label: 'Contact', num: '08' },
];

const allLinks = [
  { href: '/about', label: 'About', num: '01' },
  { href: '/shuga-cars', label: 'SHUGA FLEET', num: '02' },
  { href: '/shuga-ride', label: 'Shuga Ride', num: '03' },
  { href: '/shuga-energy', label: 'Shuga Energy', num: '04' },
  { href: '/investors', label: 'Investors', num: '05' },
  { href: '/waitlist', label: 'Waitlist', num: '06' },
  { href: '/faq', label: 'FAQ', num: '07' },
  { href: '/contact', label: 'Contact', num: '08' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label="SHUGA Empire HoldCo home" onClick={() => setOpen(false)}>
            <Image
              src="/text logo with icon.jpeg"
              alt="SHUGA Empire HoldCo"
              width={160}
              height={48}
              className={styles.logo}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.navDesktop}>
            {desktopLinks.map(l => (
              <Link key={l.href} href={l.href} className={styles.navLink}>
                {l.label}
              </Link>
            ))}
          </nav>


          {/* Mobile Right Controls: Hamburger only */}
          <div className={styles.mobileControls}>
            <button
              className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropActive : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Mobile Slide-in Drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} aria-hidden={!open}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <span className={styles.drawerLogoText}>SHUGA EMPIRE HOLDCO</span>
            <span className={styles.drawerStatusBadge}>
              <span className={styles.drawerStatusDot} />
              ONLINE
            </span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {allLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.drawerLink}
              onClick={() => setOpen(false)}
            >
              <div className={styles.drawerLinkLeft}>
                <span className={styles.drawerLinkNum}>{l.num}</span>
                <span className={styles.drawerLinkLabel}>{l.label}</span>
              </div>
              <span className={styles.drawerLinkArrow}>→</span>
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <Link
            href="/waitlist"
            className={styles.drawerWaitlistBtn}
            onClick={() => setOpen(false)}
          >
            <span className={styles.ctaDot} />
            Join Early Access Waitlist
          </Link>
          <Link
            href="/shuga-cars"
            className={styles.drawerCarBtn}
            onClick={() => setOpen(false)}
          >
            Apply For Vehicle (Drive to Own)
          </Link>
          <div className={styles.drawerContactInfo}>
            <span>Lagos & Abuja, Nigeria</span>
            <span>&bull;</span>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact Team</Link>
          </div>
        </div>
      </div>
    </>
  );
}

