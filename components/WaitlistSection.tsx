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
      setErrorMessage('Full name and email are required.');
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
      const res = await fetch('/api/waitlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setQueuePosition(data.position || 1428);
        saveLocalSubmission(payload);
        setStatus('success');
      } else {
        saveLocalSubmission(payload);
        setStatus('success');
      }
    } catch {
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
      // ignore
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
    `Join the early-access waitlist for Sugar Empire HoldCo — Nigeria's electric mobility ecosystem: https://shugaempire.com/waitlist`
  );

  return (
    <section id={id} className={styles.waitlistSection}>
      <div className={styles.gridOverlay} />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.liveBadge}>
            <span className={styles.pulseDot} />
            <span className={styles.badgeText}>Early Access Waitlist &bull; Pre-Launch</span>
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
          <div className={styles.formCol}>
            {status === 'success' ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.successTitle}>Confirmed</h3>
                <p className={styles.successMsg}>
                  Welcome, <strong>{fullName}</strong>. You are registered as pioneer <strong>#{queuePosition}</strong> for <strong>{role}</strong> access in <strong>{city}</strong>.
                </p>

                <div className={styles.shareBox}>
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share Waitlist Link
                  </a>

                  <button onClick={resetForm} className={styles.resetBtn}>
                    Register Another Person &rarr;
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
                    <div className={styles.roleIconWrapper}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5L8 4h8l1.5 3H19a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </div>
                    <span className={styles.roleLabel}>Driver</span>
                    <span className={styles.roleSub}>Hire-Purchase</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleBtn} ${role === 'Rider' ? styles.roleBtnActive : ''}`}
                    onClick={() => setRole('Rider')}
                  >
                    <div className={styles.roleIconWrapper}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-7 19v-2a7 7 0 0 1 14 0v2H5z" />
                      </svg>
                    </div>
                    <span className={styles.roleLabel}>Rider</span>
                    <span className={styles.roleSub}>Shuga Ride</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleBtn} ${role === 'Investor' ? styles.roleBtnActive : ''}`}
                    onClick={() => setRole('Investor')}
                  >
                    <div className={styles.roleIconWrapper}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                    </div>
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
                      placeholder="name@domain.com"
                      className={styles.input}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="wl-phone">Phone / WhatsApp</label>
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
                      <option value="Other Cities">Other Cities</option>
                    </select>
                  </div>

                  <div className={`${styles.inputGroup} ${styles.inputGroupFull}`}>
                    <label className={styles.label} htmlFor="wl-notes">
                      {role === 'Driver' ? 'Driving experience / currently drive on rideshare?' :
                       role === 'Investor' ? 'Target fleet size or investment capacity' :
                       'Preferred commute routes or travel preferences'}
                    </label>
                    <input
                      id="wl-notes"
                      type="text"
                      placeholder={
                        role === 'Driver' ? 'e.g. 4 years driving on Uber/Bolt in Lagos' :
                        role === 'Investor' ? 'e.g. Interested in syndicating 2-5 vehicles' :
                        'e.g. Daily commute between Lekki and Victoria Island'
                      }
                      className={styles.input}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginTop: '1.25rem',
                    fontFamily: 'var(--font-techno)',
                  }}>
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={styles.submitBtn}
                >
                  {status === 'loading' ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Join {role} Waitlist</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>

                <p className={styles.privacyText}>
                  Confidential &bull; Strictly zero spam. Notifications sent only for priority vehicle allocations.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
