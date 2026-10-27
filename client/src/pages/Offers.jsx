import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import { Loader } from '../components/common/Loader';
import { Tag, Copy, Check, Sparkles, Percent } from 'lucide-react';

export const Offers = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/available');
        setCoupons(res.data || []);
      } catch (err) {
        console.error('Failed to load coupons', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>Exclusive Promotions</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Discounts & Offers</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Apply these coupon codes during checkout to enjoy special discounts on movie tickets
        </p>
      </div>

      {loading ? (
        <Loader size="large" text="Fetching available promo codes..." />
      ) : coupons.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {coupons.map((c) => (
            <div
              key={c._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px dashed rgba(229, 57, 69, 0.4)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    letterSpacing: '1px'
                  }}
                >
                  {c.code}
                </span>

                <button
                  onClick={() => handleCopy(c.code)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  {copiedCode === c.code ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                  <span>{copiedCode === c.code ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{c.description}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}% discount up to ₹${c.maxDiscount}`
                    : `Flat ₹${c.discountValue} discount`}
                  {c.minimumBookingAmount > 0 && ` on minimum order of ₹${c.minimumBookingAmount}`}
                </p>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Valid until: {new Date(c.validUntil).toLocaleDateString()}</span>
                <span>Limit: {c.perUserLimit} use per user</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
          <Tag size={44} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Active Offers</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Check back soon for new blockbuster deals!
          </p>
        </div>
      )}
    </div>
  );
};
