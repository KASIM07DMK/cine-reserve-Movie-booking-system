import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, ShieldCheck, HeartHandshake, Film, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0C0C0F', borderTop: '1px solid var(--border-subtle)', padding: '4rem 0 2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <img src="/logo.jpg" alt="CineReserve Logo" className="brand-logo-img" style={{ width: '32px', height: '32px' }} />
              <span>Cine<span className="accent-word">Reserve</span></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Experience the magic of cinema with seamless discovery, interactive seat selection, instant ticketing, and secure reservations.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                ⚡ 100% Secure MERN
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'rgba(229,57,69,0.15)', color: 'var(--accent-primary)' }}>
                🎟️ Instant E-Tickets
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#FFFFFF' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/movies" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Now Showing Movies</Link></li>
              <li><Link to="/movies?status=upcoming" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upcoming Releases</Link></li>
              <li><Link to="/cinemas" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse Cinemas</Link></li>
              <li><Link to="/offers" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Discounts & Promo Codes</Link></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#FFFFFF' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/help" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Help Center & FAQ</Link></li>
              <li><Link to="/help#cancellation" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cancellation Policy</Link></li>
              <li><Link to="/help#terms" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms & Conditions</Link></li>
              <li><Link to="/help#privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Security & Verification Guarantee */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#FFFFFF' }}>CineReserve Trust</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="var(--status-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Verified Gates:</strong> Every ticket contains an HMAC-authenticated QR code scanned at theater entry.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Sparkles size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Real-Time Seat Locks:</strong> Concurrency-safe atomic holds guarantee your selected seats are never double-booked.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} CineReserve Technologies Pvt Ltd. All rights reserved.</p>
          <p>Handcrafted for cinema lovers across India.</p>
        </div>
      </div>
    </footer>
  );
};
