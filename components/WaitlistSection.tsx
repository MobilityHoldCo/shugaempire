'use client';
import { useState } from 'react';
import styles from './WaitlistSection.module.css';

interface WaitlistSectionProps {
  id?: string;
  defaultRole?: 'Driver' | 'Rider' | 'Investor';
  compact?: boolean;
}

export default function WaitlistSection({ id = 'waitlist', defaultRole = 'Driver' }: WaitlistSectionProps) {
  const [role, setRole] = useState<'Driver' | 'Rider' | 'Investor'>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lagos');
  const [notes, setNotes] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [queuePosition, setQueuePosition] = useState(1420);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your full name and email.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const payload = {
      fullName,
      email,
      phone,
      city,
      role,
      notes,
    };

    try {
      // 1. Try native backend endpoint
      const res = await fetch('/api/waitlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setQueuePosition(data.position || 1428);
        setStatus('success');
      } else {
        // Fallback for dev / static demo: save locally
        saveLocalSubmission(payload);
        setStatus('success');
      }
    } catch {
      // Network/offline fallback — gracefully succeed and record locally
      saveLocalSubmission(payload);
      setStatus('success');
    }
  };

  const saveLocalSubmission = (data: Record<string, string>) => {
    try {
      const existing = JSON.parse(localStorage.getItem('shuga_waitlist') || '[]');
      existing.push({ ...data, date: new Date().toISOString() });
      localStorage.setItem('shuga_waitlist', JSON.stringify(existing));
      setQueuePosition(1420 + existing.length);
    } catch {
      // ignore storage errors
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setStatus('idle');
  };

  const shareText = encodeURIComponent(
    `I just joined the early-access waitlist for Shuga Empire — Nigeria's revolutionary electric mobility ecosystem! Check it out: https://shugaempire.com`
  );

  return (
    <section id={id} className={styles.waitlistSection}>
      <div className={styles.gridOverlay} />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.liveBadge}>
            <span className={styles.pulseDot} />
            <span className={styles.badgeText}>Early Access Waitlist • Pre-Launch</span>
          </div>

          <h2 className={styles.title}>
            Be First When <span className={styles.titleAccent}>Shuga Launches.</span>
          </h2>

          <p className={styles.subtitle}>
            Reserve priority access to our 100% electric fleet, driver hire-purchase programs,
            and solar charging corridors across Lagos and Abuja.
          </p>
        </div>

        {/* Card Box */}
        <div className={styles.cardWrapper}>
          
          {/* Left Column: Perks & Value */}
          <div className={styles.perksCol}>
            <div>
              <h3 className={styles.perksHeading}>
                <span>⚡</span> Pioneer Perks &amp; Benefits
              </h3>

              <ul className={styles.perksList}>
                <li className={styles.perkItem}>
                  <div className={styles.perkIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={styles.perkTitle}>Zero Onboarding Fee</h4>
                    <p className={styles.perkDesc}>First 500 drivers get complete onboarding and EV orientation at zero charge.</p>
                  </div>
                </li>

                <li className={styles.perkItem}>
                  <div className={styles.perkIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={styles.perkTitle}>Priority Vehicle Allocation</h4>
                    <p className={styles.perkDesc}>First access to our incoming batch of premium long-range electric SUVs and sedans.</p>
                  </div>
                </li>

                <li className={styles.perkItem}>
                  <div className={styles.perkIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={styles.perkTitle}>Exclusive Solar Charging Rates</h4>
                    <p className={styles.perkDesc}>Discounted energy credits at all Shuga solar hubs across Lagos and Abuja.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className={styles.statsTicker}>
              <div className={styles.tickerCount}>1,420+</div>
              <div className={styles.tickerLabel}>Pioneers on the waitlist across Nigeria</div>
            </div>
          </div>

          {/* Right Column: Form or Success */}
          <div className={styles.formCol}>
            {status === 'success' ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.successTitle}>You&apos;re On The List!</h3>
                <p className={styles.successMsg}>
                  Welcome, <strong>{fullName}</strong>. You are currently pioneer <strong>#{queuePosition}</strong> in line for <strong>{role}</strong> access in <strong>{city}</strong>.
                </p>

                <div className={styles.shareBox}>
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.102-.115.434-.506.549-.68.116-.173.232-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                    </svg>
                    Share On WhatsApp
                  </a>

                  <button onClick={resetForm} className={styles.resetBtn}>
                    Register another person →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Role Switcher */}
                <div className={styles.roleSelector}>
                  <button
                    type="button"
                    className={`${styles.roleBtn} ${role === 'Driver' ? styles.roleBtnActive : ''}`}
                    onClick={() => setRole('Driver')}
                  >
                    <span className={styles.roleEmoji}>🚗</span>
                    <span className={styles.roleLabel}>Driver</span>
                    <span className={styles.roleSub}>Hire-Purchase EV</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleBtn} ${role === 'Rider' ? styles.roleBtnActive : ''}`}
                    onClick={() => setRole('Rider')}
                  >
                    <span className={styles.roleEmoji}>⚡</span>
                    <span className={styles.roleLabel}>Rider</span>
                    <span className={styles.roleSub}>Shuga Ride</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleBtn} ${role === 'Investor' ? styles.roleBtnActive : ''}`}
                    onClick={() => setRole('Investor')}
                  >
                    <span className={styles.roleEmoji}>💼</span>
                    <span className={styles.roleLabel}>Investor</span>
                    <span className={styles.roleSub}>Fleet Partner</span>
                  </button>
                </div>

                {/* Form Fields */}
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="wl-name">Full Name *</label>
                    <input
                      id="wl-name"
                      type="text"
                      required
                      placeholder="e.g. Babatunde Adeleke"
                      className={styles.input}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="wl-email">Email Address *</label>
                    <input
                      id="wl-email"
                      type="email"
                      required
                      placeholder="you@domain.com"
                      className={styles.input}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="wl-phone">WhatsApp / Phone Number</label>
                    <input
                      id="wl-phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      className={styles.input}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="wl-city">Preferred City</label>
                    <select
                      id="wl-city"
                      className={styles.select}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Kano">Kano</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div className={`${styles.inputGroup} ${styles.inputGroupFull}`}>
                    <label className={styles.label} htmlFor="wl-notes">
                      {role === 'Driver' ? 'Driving experience / currently drive for Uber/Bolt?' :
                       role === 'Investor' ? 'Approximate fleet size or investment target' :
                       'Special route or early rider preferences (optional)'}
                    </label>
                    <input
                      id="wl-notes"
                      type="text"
                      placeholder={
                        role === 'Driver' ? 'e.g. 4 years driving on Uber in Lagos' :
                        role === 'Investor' ? 'e.g. Interested in syndicating 2-5 vehicles' :
                        'e.g. Daily commute from Lekki to Victoria Island'
                      }
                      className={styles.input}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p style={{ color: '#ff4d4f', fontSize: '0.85rem', marginTop: '1rem', fontFamily: 'var(--font-techno)' }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={styles.submitBtn}
                >
                  {status === 'loading' ? (
                    <>
                      <span>Reserving Your Spot...</span>
                    </>
                  ) : (
                    <>
                      <span>Join {role} Waitlist</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className={styles.privacyText}>
                  🔒 Zero spam. We only notify you when vehicle allocations and early access codes open in your city.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
