'use client';
import { useState, useEffect, useRef } from 'react';
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

  const [subsidiariesOpen, setSubsidiariesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDropdownEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSubsidiariesOpen(true);
  };

  const handleDropdownLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setSubsidiariesOpen(false);
    }, 180);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubsidiariesOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSubsidiariesOpen(false);
      }
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
            <Link href="/about" className={styles.navLink}>
              About
            </Link>

            {/* Our Subsidiaries Dropdown (Desktop Screen Only) */}
            <div
              ref={dropdownRef}
              className={styles.dropdownContainer}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${subsidiariesOpen ? styles.dropdownTriggerActive : ''}`}
                onClick={() => setSubsidiariesOpen(prev => !prev)}
                aria-expanded={subsidiariesOpen}
                aria-haspopup="true"
              >
                <span>Our Subsidiaries</span>
                <svg
                  className={`${styles.dropdownChevron} ${subsidiariesOpen ? styles.dropdownChevronOpen : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="13"
                  height="13"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {subsidiariesOpen && (
                <div className={styles.dropdownMenu} role="menu" aria-label="Our Subsidiaries">
                  <Link
                    href="/shuga-cars"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => setSubsidiariesOpen(false)}
                  >
                    <span>Sugar Fleet</span>
                    <span className={styles.dropdownItemArrow}>&rarr;</span>
                  </Link>

                  <Link
                    href="/shuga-ride"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => setSubsidiariesOpen(false)}
                  >
                    <span>Sugar Ride</span>
                    <span className={styles.dropdownItemArrow}>&rarr;</span>
                  </Link>

                  <Link
                    href="/shuga-energy"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => setSubsidiariesOpen(false)}
                  >
                    <span>Sugar Energy</span>
                    <span className={styles.dropdownItemArrow}>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/waitlist" className={styles.navLink}>
              Waitlist
            </Link>
            <Link href="/faq" className={styles.navLink}>
              FAQ
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
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

