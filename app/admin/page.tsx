'use client';
import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = 'https://admin.shugaempire.com';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#ffffff',
      fontFamily: 'var(--font-techno)',
      fontSize: '0.85rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }}>
      Redirecting to admin.shugaempire.com...
    </div>
  );
}
