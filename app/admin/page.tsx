'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from './admin.module.css';

interface Lead {
  id: number | string;
  timestamp: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: 'Driver' | 'Rider' | 'Investor' | string;
  notes?: string;
  status: 'New' | 'Contacted' | 'Vetted' | 'Allocated' | string;
}

const DEFAULT_PASSCODE = 'ShugaAdmin2026!';

// Sample seed leads representing incoming waitlist activity
const SEED_LEADS: Lead[] = [
  { id: 101, timestamp: '2026-09-09 18:42:10', fullName: 'Oluwaseun Adeleke', email: 'o.adeleke@gmail.com', phone: '+234 803 452 9182', city: 'Lagos', role: 'Driver', notes: '5 years commercial experience on Uber Lagos', status: 'Vetted' },
  { id: 102, timestamp: '2026-09-09 19:15:30', fullName: 'Dr. Ibrahim Danjuma', email: 'danjuma.invest@holdings.ng', phone: '+234 802 884 1102', city: 'Abuja', role: 'Investor', notes: 'Looking to syndicate 5 electric SUVs for fleet', status: 'Contacted' },
  { id: 103, timestamp: '2026-09-09 20:04:45', fullName: 'Chidinma Okonkwo', email: 'chidinma.o@yahoo.com', phone: '+234 814 220 9831', city: 'Lagos', role: 'Rider', notes: 'Daily commute between Victoria Island & Lekki', status: 'New' },
  { id: 104, timestamp: '2026-09-09 21:30:12', fullName: 'Emmanuel Babatunde', email: 'emmanuel.b@gmail.com', phone: '+234 805 771 4439', city: 'Lagos', role: 'Driver', notes: 'Valid LASDRI & FRSC licenses', status: 'New' },
  { id: 105, timestamp: '2026-09-09 22:11:05', fullName: 'Amina Bello', email: 'amina.bello@fct.gov.ng', phone: '+234 809 123 7765', city: 'Abuja', role: 'Rider', notes: 'Airport & Central Business District commute', status: 'Contacted' },
  { id: 106, timestamp: '2026-09-09 23:55:18', fullName: 'Capital Ventures NG', email: 'invest@capventures.com', phone: '+234 818 990 0012', city: 'Other Cities', role: 'Investor', notes: 'Port Harcourt expansion syndicate', status: 'New' },
];

export default function AdminWaitlistPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Check saved session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('shuga_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchLeads(DEFAULT_PASSCODE);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === DEFAULT_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('shuga_admin_auth', 'true');
      setLoginError('');
      fetchLeads(passcode);
    } else {
      setLoginError('Incorrect Admin Passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shuga_admin_auth');
  };

  // Fetch real leads from PHP backend + localStorage
  const fetchLeads = async (authKey: string) => {
    try {
      const res = await fetch(`/api/admin_waitlist.php?key=${encodeURIComponent(authKey)}`);
      let serverLeads: Lead[] = [];
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          serverLeads = json.data;
        }
      }

      // Check local storage submissions
      const local = JSON.parse(localStorage.getItem('shuga_waitlist') || '[]');
      const localFormatted: Lead[] = local.map((item: Record<string, string>, idx: number) => ({
        id: `loc-${idx + 1}`,
        timestamp: item.date ? item.date.replace('T', ' ').substring(0, 19) : new Date().toISOString().substring(0, 19),
        fullName: item.fullName || 'Anonymous',
        email: item.email || '',
        phone: item.phone || '',
        city: item.city || 'Lagos',
        role: item.role || 'Driver',
        notes: item.notes || '',
        status: 'New',
      }));

      // Combine with seeds for full pipeline overview
      const combined = [...localFormatted, ...serverLeads, ...SEED_LEADS];
      
      // Deduplicate by email
      const seen = new Set();
      const unique = combined.filter(l => {
        if (!l.email) return true;
        if (seen.has(l.email.toLowerCase())) return false;
        seen.add(l.email.toLowerCase());
        return true;
      });

      setLeads(unique);
    } catch {
      // ignore, seed data active
    }
  };

  // Status Change Handler
  const handleStatusChange = (id: number | string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Notes', 'Status'];
    const rows = filteredLeads.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.city.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shuga_waitlist_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (phone: string, name: string) => {
    // Strip non-digits
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.substring(1);
    } else if (clean.startsWith('234')) {
      // already 234
    } else if (!clean.startsWith('234') && clean.length === 10) {
      clean = '234' + clean;
    }
    const msg = encodeURIComponent(`Hello ${name}, this is the Shuga Empire operations team regarding your waitlist application.`);
    return `https://wa.me/${clean}?text=${msg}`;
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch =
        l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.toLowerCase().includes(search.toLowerCase()) ||
        (l.notes && l.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'All' || l.role === roleFilter;
      const matchesCity = cityFilter === 'All' || l.city === cityFilter;
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;

      return matchesSearch && matchesRole && matchesCity && matchesStatus;
    });
  }, [leads, search, roleFilter, cityFilter, statusFilter]);

  // Metrics
  const totalCount = leads.length;
  const driversCount = leads.filter(l => l.role === 'Driver').length;
  const ridersCount = leads.filter(l => l.role === 'Rider').length;
  const investorsCount = leads.filter(l => l.role === 'Investor').length;

  if (!isAuthenticated) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className={styles.loginTitle}>Shuga Admin</h1>
            <p className={styles.loginSub}>Waitlist Operations Portal</p>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Enter Admin Passcode"
                className={styles.loginInput}
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
              />

              {loginError && <p className={styles.errorMsg}>{loginError}</p>}

              <button type="submit" className={styles.loginBtn}>
                Authenticate Access &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>Waitlist Command Center</h1>
            <p className={styles.headerSub}>Module 1 &bull; Pre-Launch Leads &amp; Applicant Pipeline</p>
          </div>

          <div className={styles.headerActions}>
            <button onClick={exportToCSV} className={styles.btnAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export to Excel / CSV
            </button>

            <button onClick={handleLogout} className={styles.btnLogout}>
              Exit Admin
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Pipeline Leads</div>
            <div className={styles.metricValue}>{totalCount}</div>
            <div className={styles.metricSub}>Active registered pioneers</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Drivers (SHUGA FLEET)</div>
            <div className={styles.metricValue}>{driversCount}</div>
            <div className={styles.metricSub}>{Math.round((driversCount / (totalCount || 1)) * 100)}% of pipeline</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Riders (Shuga Ride)</div>
            <div className={styles.metricValue}>{ridersCount}</div>
            <div className={styles.metricSub}>{Math.round((ridersCount / (totalCount || 1)) * 100)}% of pipeline</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Fleet Investors</div>
            <div className={styles.metricValue}>{investorsCount}</div>
            <div className={styles.metricSub}>{Math.round((investorsCount / (totalCount || 1)) * 100)}% of pipeline</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, or notes..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterControls}>
            <select
              className={styles.filterSelect}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Driver">Drivers</option>
              <option value="Rider">Riders</option>
              <option value="Investor">Investors</option>
            </select>

            <select
              className={styles.filterSelect}
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            >
              <option value="All">All Cities</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Other Cities">Other Cities</option>
            </select>

            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Vetted">Vetted</option>
              <option value="Allocated">Allocated</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Applicant</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>City</th>
                <th className={styles.th}>Notes &amp; Target</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Direct Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No waitlist applicants match your current filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.leadName}>{lead.fullName}</div>
                      <div className={styles.leadContact}>{lead.email} &bull; {lead.phone}</div>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.roleBadge}>{lead.role}</span>
                    </td>

                    <td className={styles.td}>{lead.city}</td>

                    <td className={styles.td} style={{ maxWidth: '280px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        {lead.notes || '—'}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <select
                        className={styles.statusSelect}
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Vetted">Vetted</option>
                        <option value="Allocated">Allocated</option>
                      </select>
                    </td>

                    <td className={styles.td} style={{ fontFamily: 'var(--font-techno)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {lead.timestamp}
                    </td>

                    <td className={styles.td}>
                      <div className={styles.actionGroup}>
                        {lead.phone && (
                          <a
                            href={getWhatsAppLink(lead.phone, lead.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            title="Chat on WhatsApp"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.102-.115.434-.506.549-.68.116-.173.232-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                            </svg>
                          </a>
                        )}

                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=Shuga Empire Waitlist Update`}
                            className={styles.actionBtn}
                            title="Send Email"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
