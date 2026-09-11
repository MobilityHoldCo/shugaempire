'use client';
import { useState } from 'react';
import styles from './ContactForm.module.css';

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

    try {
      let success = false;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            fullName: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            interest: formData.interest,
            message: formData.message.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          success = true;
        }
      } catch {
        // Fallback to direct client-side insert if API route fails
      }

      if (!success) {
        const { getSupabase } = await import('@/lib/supabase');
        const { error: insErr } = await getSupabase()
          .from('contacts')
          .insert([
            {
              full_name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              phone: formData.phone.trim() || null,
              interest: formData.interest || 'general',
              message: formData.message.trim(),
              source: 'contact_page',
              status: 'new',
            },
          ]);

        if (!insErr) {
          success = true;
        }
      }

      if (success) {
        setSubmitted(true);
      } else {
        setError('Failed to transmit enquiry. Please check your connection and try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
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
          <option value="driver">Driver — I want a Shuga Car (Drive to Own)</option>
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
