'use client';
import { useState } from 'react';
import styles from './ContactForm.module.css';

const ENDPOINTS = [
  '/api/contact.php',
  'https://shugaempire.com/api/contact.php',
  '/api/admin_waitlist.php?action=contact_submit',
  'https://shugaempire.com/api/admin_waitlist.php?action=contact_submit',
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'driver',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Please provide a message or details regarding your enquiry.');
      return;
    }

    setLoading(true);
    setError(null);

    let succeeded = false;
    let errorMsg = 'Failed to submit enquiry. Please try again.';

    const payload = {
      fullName: formData.name.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      interest: formData.interest,
      role: `Contact - ${formData.interest.charAt(0).toUpperCase() + formData.interest.slice(1)}`,
      message: formData.message.trim(),
      notes: formData.message.trim(),
      city: 'Nigeria',
      source: 'contact_page',
    };

    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (!json || json.success !== false) {
            succeeded = true;
            break;
          }
        }
      } catch (err) {
        // Continue to fallback endpoint
      }
    }

    setLoading(false);

    if (succeeded) {
      setSubmitted(true);
    } else {
      setError(errorMsg);
    }
  };

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Enquiry Transmitted</h3>
        <p className={styles.successDesc}>
          Thank you, <strong>{formData.name}</strong>. Your message has been logged directly into the Shuga Admin Command Center. A team director will review your enquiry and connect with you shortly.
        </p>
        <button
          className={styles.resetBtn}
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', interest: 'driver', message: '' });
            setSubmitted(false);
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.formWrapper} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          Full Name <span style={{ color: '#fff' }}>*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Tunde Adeyemi"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          Email Address <span style={{ color: '#fff' }}>*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. tunde@example.com"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-phone" className={styles.label}>
          Phone Number
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+234 000 000 0000"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-interest" className={styles.label}>
          I Am A…
        </label>
        <select
          id="contact-interest"
          name="interest"
          value={formData.interest}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="driver">Driver — I want a Shuga Car (Hire-Purchase)</option>
          <option value="investor">Investor — I want to acquire a vehicle & participate</option>
          <option value="passenger">Passenger — Ride-Hailing enquiry</option>
          <option value="partner">Corporate / Energy Partner</option>
          <option value="other">General Enquiry</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>
          Message Details <span style={{ color: '#fff' }}>*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe how we can assist you..."
          required
          className={styles.textarea}
        />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading} data-cursor>
        {loading ? (
          <>
            <span className={styles.spinner} />
            Transmitting Details...
          </>
        ) : (
          'Send Message To Shuga Admin →'
        )}
      </button>
    </form>
  );
}
