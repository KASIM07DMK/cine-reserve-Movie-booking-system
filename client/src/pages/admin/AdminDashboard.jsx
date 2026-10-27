import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatTime } from '../../utils/formatDate';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Ticket,
  Users,
  IndianRupee,
  ScanLine,
  Plus,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Gate Scanner state
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // New Movie Form
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    genres: 'Action, Sci-Fi',
    languages: 'Telugu, Hindi, English',
    durationMinutes: 160,
    releaseDate: new Date().toISOString().split('T')[0],
    certification: 'UA'
  });
  const [creatingMovie, setCreatingMovie] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load administrator metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleValidateTicket = async (e) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.post('/tickets/validate', { token: scanToken.trim() });
      setScanResult({
        success: true,
        data: res.data
      });
      addToast('Ticket successfully verified!', 'success');
    } catch (err) {
      setScanResult({
        success: false,
        message: err.message || 'Invalid or already scanned ticket.'
      });
      addToast(err.message || 'Gate verification failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setCreatingMovie(true);
    try {
      await api.post('/admin/movies', {
        ...newMovie,
        durationMinutes: Number(newMovie.durationMinutes),
        genres: newMovie.genres.split(',').map((g) => g.trim()),
        languages: newMovie.languages.split(',').map((l) => l.trim())
      });
      addToast('Movie created and published successfully!', 'success');
      setNewMovie({
        title: '',
        description: '',
        posterUrl: '',
        backdropUrl: '',
        genres: 'Action, Sci-Fi',
        languages: 'Telugu, Hindi, English',
        durationMinutes: 160,
        releaseDate: new Date().toISOString().split('T')[0],
        certification: 'UA'
      });
      fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to create movie.', 'error');
    } finally {
      setCreatingMovie(false);
    }
  };

  if (loading) {
    return <Loader size="large" text="Connecting to admin portal..." />;
  }

  const { metrics, recentBookings } = data || {};

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Management Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            System metrics, movie catalog, gate scanner, and live revenue audit
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
            { id: 'scanner', label: 'Gate QR Scanner', icon: <ScanLine size={15} /> },
            { id: 'movies', label: 'Add Movie', icon: <Plus size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(metrics?.totalRevenue || 0), icon: <IndianRupee size={22} color="var(--status-success)" /> },
          { label: 'Confirmed Bookings', value: metrics?.confirmedBookings || 0, icon: <Ticket size={22} color="var(--accent-primary)" /> },
          { label: 'Active Movies', value: metrics?.totalMovies || 0, icon: <Film size={22} color="#3B82F6" /> },
          { label: 'Scheduled Shows', value: metrics?.totalShows || 0, icon: <Calendar size={22} color="#F5A623" /> },
          { label: 'Registered Customers', value: metrics?.totalUsers || 0, icon: <Users size={22} color="#10B981" /> }
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</span>
              {m.icon}
            </div>
            <strong style={{ fontSize: '1.6rem', fontWeight: 800 }}>{m.value}</strong>
          </div>
        ))}
      </div>

      {/* Tab 1: Overview & Recent Bookings */}
      {activeTab === 'overview' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Recent Platform Bookings</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Movie</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Seats</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings?.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {b.bookingReference}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {b.movieSnapshot?.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {b.user?.name || b.guestDetails?.name || 'Guest User'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {b.selectedSeats?.map((s) => s.seatCode).join(', ')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: b.bookingStatus === 'confirmed' ? 'rgba(46,173,114,0.15)' : 'rgba(229,57,69,0.15)',
                          color: b.bookingStatus === 'confirmed' ? 'var(--status-success)' : 'var(--status-danger)',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Gate QR Ticket Scanner Simulation */}
      {activeTab === 'scanner' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <ScanLine size={36} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Gate Entrance Ticket Scanner</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Authorized cinema staff verification for digital pass QR tokens
            </p>
          </div>

          <form onSubmit={handleValidateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Scan or Paste Ticket Token (e.g. CR-2026-XXXX.token)
              </label>
              <input
                type="text"
                required
                value={scanToken}
                onChange={(e) => setScanToken(e.target.value)}
                placeholder="Enter token from QR code..."
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>

            <button type="submit" disabled={scanning} className="btn btn-primary btn-block">
              {scanning ? 'Verifying HMAC Signature...' : 'Validate Entry Pass'}
            </button>
          </form>

          {/* Validation Result Box */}
          {scanResult && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: scanResult.success ? 'rgba(46,173,114,0.1)' : 'rgba(229,57,69,0.1)',
                border: `1px solid ${scanResult.success ? 'var(--status-success)' : 'var(--status-danger)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {scanResult.success ? (
                  <CheckCircle2 size={20} color="var(--status-success)" />
                ) : (
                  <AlertTriangle size={20} color="var(--status-danger)" />
                )}
                <strong style={{ color: scanResult.success ? 'var(--status-success)' : 'var(--status-danger)', fontSize: '1rem' }}>
                  {scanResult.success ? 'ADMITTED — Ticket Valid' : 'ENTRY DENIED'}
                </strong>
              </div>

              {scanResult.success ? (
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p>Movie: <strong>{scanResult.data?.booking?.movieTitle}</strong></p>
                  <p>Seats: <strong>{scanResult.data?.booking?.seats?.join(', ')}</strong></p>
                  <p>Cinema: <strong>{scanResult.data?.booking?.cinemaName} ({scanResult.data?.booking?.screenName})</strong></p>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {scanResult.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Add Movie */}
      {activeTab === 'movies' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Add New Movie to Catalog</h2>

          <form onSubmit={handleCreateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Movie Title *
              </label>
              <input
                type="text"
                required
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                placeholder="e.g. Gladiator II"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={newMovie.description}
                onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                placeholder="Synopsis of the movie..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Poster Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={newMovie.posterUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Backdrop Image URL
                </label>
                <input
                  type="url"
                  value={newMovie.backdropUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, backdropUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newMovie.durationMinutes}
                  onChange={(e) => setNewMovie({ ...newMovie, durationMinutes: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Certification
                </label>
                <select
                  value={newMovie.certification}
                  onChange={(e) => setNewMovie({ ...newMovie, certification: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="U">U (Universal)</option>
                  <option value="UA">UA (Parental Guidance)</option>
                  <option value="A">A (Adults Only)</option>
                  <option value="PG-13">PG-13</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={creatingMovie} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
              {creatingMovie ? 'Creating...' : 'Publish Movie'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
