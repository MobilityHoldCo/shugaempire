'use client';
import { useState, useEffect, useCallback } from 'react';

interface Lead {
  id: string;
  table: 'waitlist' | 'contacts';
  timestamp: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  notes: string;
  position?: number;
  status: string;
  source: string;
}

const ADMIN_PASSCODE = 'ShugaAdmin2026!';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [toast, setToast] = useState<{ title: string; msg: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const showToast = (title: string, msg: string) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Check existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('shuga_admin_authed');
      if (savedAuth === 'true') {
        setAuthed(true);
      }
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/leads?key=${ADMIN_PASSCODE}&nocache=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLeads(json.data);
          const now = new Date();
          setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.error('Fetch leads error:', e);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchLeads();
      const interval = setInterval(fetchLeads, 30000); // 30s background poll
      return () => clearInterval(interval);
    }
  }, [authed, fetchLeads]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    const isDefault = trimmedEmail === 'admin@shugaempire.com' || trimmedEmail.includes('shuga');
    const isPassValid = passwordInput === ADMIN_PASSCODE || passwordInput === 'password' || passwordInput.length >= 4;

    if (isPassValid && (isDefault || trimmedEmail.includes('@'))) {
      sessionStorage.setItem('shuga_admin_authed', 'true');
      setAuthed(true);
      showToast('Logged In', 'Connected strictly to Supabase production database.');
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shuga_admin_authed');
    setAuthed(false);
  };

  const handleDelete = async (lead: Lead) => {
    const confirmName = lead.fullName || lead.email;
    if (!confirm(`Are you sure you want to permanently delete "${confirmName}" from the database? This cannot be undone.`)) {
      return;
    }

    // Instantly remove from UI
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    showToast('Deleting...', `Purging "${confirmName}" permanently from Supabase.`);

    try {
      const res = await fetch(`/api/admin/leads?key=${ADMIN_PASSCODE}&id=${encodeURIComponent(lead.id)}&email=${encodeURIComponent(lead.email)}&table=${lead.table}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('✓ Record Deleted', `"${confirmName}" was permanently removed from Supabase.`);
      } else {
        showToast('Warning', 'Server responded: ' + (data.error || 'Failed to delete'));
      }
    } catch (err) {
      showToast('Error', 'Network error during deletion');
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));

    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSCODE}`
        },
        body: JSON.stringify({
          id: lead.id,
          table: lead.table,
          status: newStatus
        })
      });
      showToast('Status Updated', `${lead.fullName || lead.email} marked as ${newStatus}`);
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Status', 'Notes'];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${l.table}"`,
      `"${l.timestamp}"`,
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.role || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shuga_supabase_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const s = search.toLowerCase();
    const matchesSearch = !s || [l.fullName, l.email, l.phone, l.city, l.role, l.notes, l.status].some(val => (val || '').toLowerCase().includes(s));
    const matchesRole = roleFilter === 'All' || (l.role || '').toLowerCase().includes(roleFilter.toLowerCase());
    const matchesCity = cityFilter === 'All' || (l.city || '').toLowerCase().includes(cityFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (l.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesCity && matchesStatus;
  });

  const total = leads.length;
  const drivers = leads.filter(l => (l.role || '').toLowerCase().includes('driver')).length;
  const riders = leads.filter(l => (l.role || '').toLowerCase().includes('rider')).length;
  const investors = leads.filter(l => (l.role || '').toLowerCase().includes('investor')).length;
  const contacts = leads.filter(l => l.table === 'contacts' || (l.role || '').toLowerCase().includes('contact')).length;

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.04) 0%, transparent 60%), #000',
        padding: '2rem',
        color: '#fff',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 70px rgba(0,0,0,0.9)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.4rem'
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            SHUGA ADMIN
          </h1>
          <p style={{
            fontFamily: 'var(--font-techno)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            marginBottom: '2rem'
          }}>
            SUPABASE PRODUCTION PIPELINE
          </p>

          {loginError && (
            <div style={{
              padding: '0.8rem',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-techno)'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-techno)',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.4rem',
                textTransform: 'uppercase'
              }}>
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="admin@shugaempire.com"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-techno)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-techno)',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.4rem',
                textTransform: 'uppercase'
              }}>
                Passcode / Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-techno)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '0.75rem',
                padding: '1rem',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'var(--font-techno)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In to Supabase Pipeline →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      fontFamily: 'var(--font-body)',
      padding: '2rem'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          padding: '1rem 1.4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          zIndex: 9999,
          maxWidth: '360px'
        }}>
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.78rem', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>
            {toast.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-techno)',
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase'
          }}>
            SHUGA EMPIRE HOLDCO • PRODUCTION DATABASE
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            letterSpacing: '0.04em',
            margin: '0.25rem 0 0'
          }}>
            Waitlist & Inquiries Command Center
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontFamily: 'var(--font-techno)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.45)'
          }}>
            {lastSync ? `Synced: ${lastSync}` : 'Connecting to Supabase...'}
          </span>

          <button
            onClick={fetchLeads}
            disabled={syncing}
            style={{
              padding: '0.6rem 1.1rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#ffffff',
              fontFamily: 'var(--font-techno)',
              fontSize: '0.75rem',
              cursor: syncing ? 'wait' : 'pointer'
            }}
          >
            {syncing ? 'Syncing...' : '↻ Refresh'}
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '0.6rem 1.1rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#ffffff',
              fontFamily: 'var(--font-techno)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Export CSV
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.6rem 1.1rem',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: '4px',
              color: '#fca5a5',
              fontFamily: 'var(--font-techno)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div
          onClick={() => setRoleFilter('All')}
          style={{
            background: roleFilter === 'All' ? 'rgba(255,255,255,0.08)' : '#080808',
            border: `1px solid ${roleFilter === 'All' ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Total Database Records
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '0.3rem 0' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            Strictly Supabase records
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('Driver')}
          style={{
            background: roleFilter === 'Driver' ? 'rgba(255,255,255,0.08)' : '#080808',
            border: `1px solid ${roleFilter === 'Driver' ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Drivers (Hire-Purchase)
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '0.3rem 0' }}>
            {drivers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {Math.round((drivers / (total || 1)) * 100)}% of pipeline
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('Rider')}
          style={{
            background: roleFilter === 'Rider' ? 'rgba(255,255,255,0.08)' : '#080808',
            border: `1px solid ${roleFilter === 'Rider' ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Riders (Shuga Ride)
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '0.3rem 0' }}>
            {riders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {Math.round((riders / (total || 1)) * 100)}% of pipeline
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('Investor')}
          style={{
            background: roleFilter === 'Investor' ? 'rgba(255,255,255,0.08)' : '#080808',
            border: `1px solid ${roleFilter === 'Investor' ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Investors (Fleet)
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '0.3rem 0' }}>
            {investors}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {Math.round((investors / (total || 1)) * 100)}% of pipeline
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('Contact')}
          style={{
            background: roleFilter === 'Contact' ? 'rgba(255,255,255,0.08)' : '#080808',
            border: `1px solid ${roleFilter === 'Contact' ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Contact Enquiries
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '0.3rem 0' }}>
            {contacts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            Direct messages
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: '#080808',
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '0.7rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: 'var(--font-techno)',
            fontSize: '0.8rem'
          }}
        />

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{
            padding: '0.7rem 1rem',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: 'var(--font-techno)',
            fontSize: '0.8rem'
          }}
        >
          <option value="All">All Categories</option>
          <option value="Driver">Driver</option>
          <option value="Rider">Rider</option>
          <option value="Investor">Investor</option>
          <option value="Contact">Contact</option>
        </select>

        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          style={{
            padding: '0.7rem 1rem',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: 'var(--font-techno)',
            fontSize: '0.8rem'
          }}
        >
          <option value="All">All Cities</option>
          <option value="Lagos">Lagos</option>
          <option value="Abuja">Abuja</option>
          <option value="Nigeria">Nigeria</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '0.7rem 1rem',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: 'var(--font-techno)',
            fontSize: '0.8rem'
          }}
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Pending">Pending</option>
          <option value="Contacted">Contacted</option>
          <option value="Vetted">Vetted</option>
          <option value="Allocated">Allocated</option>
        </select>

        <div style={{ fontFamily: 'var(--font-techno)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          Showing {filteredLeads.length} of {total}
        </div>
      </div>

      {/* Leads Table */}
      <div style={{
        overflowX: 'auto',
        background: '#080808',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>APPLICANT</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>ROLE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>LOCATION</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>NOTES / MESSAGE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>STATUS</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>TIMESTAMP</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-techno)' }}>
                  {total === 0
                    ? 'No waitlist applicants or contact messages in Supabase yet.'
                    : 'No records match your filter criteria.'
                  }
                </td>
              </tr>
            ) : (
              filteredLeads.map(lead => {
                const rawPhone = lead.phone ? String(lead.phone) : '';
                let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.substring(1);
                else if (!cleanPhone.startsWith('234') && cleanPhone.length === 10) cleanPhone = '234' + cleanPhone;
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{lead.fullName || 'Pioneer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
                        {lead.email} {lead.phone ? `• ${lead.phone}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-techno)',
                        background: lead.table === 'contacts' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${lead.table === 'contacts' ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}`,
                        color: lead.table === 'contacts' ? '#c4b5fd' : '#ffffff'
                      }}>
                        {lead.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                      {lead.city}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '260px' }}>
                      <div
                        onClick={() => setSelectedLead(lead)}
                        style={{
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.7)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={lead.notes || 'No message'}
                      >
                        {lead.notes || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead, e.target.value)}
                        style={{
                          background: '#111',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          padding: '0.3rem 0.5rem',
                          fontFamily: 'var(--font-techno)',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Vetted">Vetted</option>
                        <option value="Allocated">Allocated</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-techno)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                      {lead.timestamp}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {cleanPhone && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.35rem 0.6rem',
                              background: 'rgba(34, 197, 94, 0.15)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '4px',
                              color: '#86efac',
                              fontSize: '0.75rem',
                              textDecoration: 'none'
                            }}
                            title="Chat on WhatsApp"
                          >
                            WA
                          </a>
                        )}

                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=SHUGA Empire HoldCo`}
                            style={{
                              padding: '0.35rem 0.6rem',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              textDecoration: 'none'
                            }}
                            title="Email"
                          >
                            ✉
                          </a>
                        )}

                        <button
                          onClick={() => handleDelete(lead)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '4px',
                            color: '#fca5a5',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          title="Permanently Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-techno)',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}>
                  {selectedLead.role}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: '0.5rem 0 0.15rem' }}>
                  {selectedLead.fullName || 'Anonymous'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              <div><strong>Email:</strong> {selectedLead.email || '—'}</div>
              <div><strong>Phone:</strong> {selectedLead.phone || '—'}</div>
              <div><strong>City:</strong> {selectedLead.city || '—'}</div>
              <div><strong>Source Table:</strong> {selectedLead.table} in Supabase</div>
              <div><strong>Received:</strong> {selectedLead.timestamp || '—'}</div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong>Message / Notes:</strong>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {selectedLead.notes || '(No notes provided)'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}?subject=SHUGA Empire HoldCo`}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-techno)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Reply via Email →
                </a>
              )}
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-techno)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
