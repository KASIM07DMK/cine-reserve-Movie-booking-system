import React from 'react';
import { HelpCircle, ShieldCheck, RefreshCw, Mail, Phone } from 'lucide-react';

export const Help = () => {
  const faqs = [
    {
      q: 'How do temporary seat holds work?',
      a: 'When you select seats and proceed to checkout, CineReserve atomically locks those seats exclusively for your session for 5 minutes. During this period, no other user can book those seats. A live countdown timer shows your remaining hold time.'
    },
    {
      q: 'What is the ticket cancellation policy?',
      a: 'You can cancel any confirmed ticket up to 2 hours before the scheduled showtime from the My Bookings section. Upon cancellation, your seats are immediately released and a 100% refund is initiated.'
    },
    {
      q: 'How do I present my ticket at the theater?',
      a: 'You do not need a physical printout. Open the digital ticket in the My Bookings section on your smartphone. Theater staff will scan the cryptographically signed HMAC QR code directly at the entry gate.'
    },
    {
      q: 'Is CineReserve secure?',
      a: 'Yes. CineReserve follows enterprise-grade security standards: Bcrypt password hashing, rate limiting, Helmet HTTP security headers, atomic database transactions, and HMAC SHA-256 signature verification for payments and tickets.'
    }
  ];

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem', maxWidth: '840px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Help & Customer Support</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Find answers to common questions about ticket bookings, seat holds, and cancellations
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              {faq.q}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.3rem' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Our dedicated support desk is available 24/7 to assist you.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Mail size={16} color="var(--accent-primary)" />
            <span>support@cinereserve.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Phone size={16} color="var(--status-success)" />
            <span>1800-200-CINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
