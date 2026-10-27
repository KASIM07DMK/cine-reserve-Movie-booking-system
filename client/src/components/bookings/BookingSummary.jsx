import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatTime } from '../../utils/formatDate';
import { Ticket, Film, MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';

export const BookingSummary = ({
  movie,
  cinema,
  show,
  selectedSeats = [],
  pricing,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponCode,
  setCouponCode,
  couponLoading = false
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        Booking Summary
      </h3>

      {/* Movie Snapshot */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {movie?.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{ width: '65px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          />
        )}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{movie?.title}</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {movie?.certification} • {show?.language || 'English'} • {show?.format || '2D'}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {cinema?.name} ({cinema?.screenName || show?.screen?.name || 'Audi 1'})
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <Calendar size={16} color="var(--accent-primary)" />
          <span>{formatDate(show?.startTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <Ticket size={16} color="var(--accent-primary)" />
          <span>{formatTime(show?.startTime)}</span>
        </div>
      </div>

      {/* Selected Seats */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Selected Seats ({selectedSeats.length})
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {selectedSeats.map((s, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(229,57,69,0.3)'
              }}
            >
              {typeof s === 'object' ? `${s.seatCode} (${s.category})` : s}
            </span>
          ))}
        </div>
      </div>

      {/* Coupon Application Box */}
      {onApplyCoupon && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
            Have a Promo Coupon?
          </label>
          {coupon ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(46, 173, 114, 0.1)',
                border: '1px solid var(--status-success)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} color="var(--status-success)" />
                <span style={{ fontWeight: 700, color: 'var(--status-success)', fontSize: '0.9rem' }}>
                  {coupon.code}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  (-{formatCurrency(coupon.discountAmount)})
                </span>
              </div>
              <button
                onClick={onRemoveCoupon}
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter coupon (e.g. CINERESERVE50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{ flex: 1, textTransform: 'uppercase', fontSize: '0.88rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onApplyCoupon}
                disabled={!couponCode || couponLoading}
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pricing Breakdown */}
      {pricing && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>Ticket Subtotal</span>
            <span>{formatCurrency(pricing.baseTicketSubtotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>Convenience Booking Fee</span>
            <span>{formatCurrency(pricing.bookingFee)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>Integrated GST Tax (18%)</span>
            <span>{formatCurrency(pricing.tax)}</span>
          </div>

          {pricing.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--status-success)', fontWeight: 600 }}>
              <span>Coupon Discount</span>
              <span>- {formatCurrency(pricing.discount)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.85rem',
              marginTop: '0.35rem'
            }}
          >
            <span>Total Payable</span>
            <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(pricing.finalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
