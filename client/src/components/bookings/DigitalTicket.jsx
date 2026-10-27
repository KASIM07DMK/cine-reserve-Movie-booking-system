import React from 'react';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { Clapperboard, Printer, MapPin, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DigitalTicket = ({ booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.bookingStatus === 'confirmed';
  const isCancelled = booking.bookingStatus === 'cancelled';

  return (
    <div style={{ margin: '2rem 0' }}>
      <div className="digital-ticket-wrapper">
        {/* Header Strip */}
        <div className="ticket-header-strip">
          <div className="ticket-brand">
            Cine<span style={{ color: '#FFE6E8' }}>Reserve</span>
          </div>
          <div className="ticket-ref">
            REF: {booking.bookingReference}
          </div>
        </div>

        {/* Body */}
        <div className="ticket-body">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isConfirmed ? 'var(--status-success)' : 'var(--status-danger)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={15} />
              <span>{isCancelled ? 'Booking Cancelled' : 'Confirmed Booking'}</span>
            </div>
            <h2 className="ticket-movie-title">{booking.movieSnapshot?.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {booking.movieSnapshot?.certification} • {booking.movieSnapshot?.language} • {booking.movieSnapshot?.format}
            </p>

            <div className="ticket-detail-grid">
              <div>
                <span className="ticket-field-label">Cinema</span>
                <p className="ticket-field-value">{booking.cinemaSnapshot?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.cinemaSnapshot?.address}</p>
              </div>

              <div>
                <span className="ticket-field-label">Screen</span>
                <p className="ticket-field-value">{booking.cinemaSnapshot?.screenName || 'Audi 1'}</p>
              </div>

              <div>
                <span className="ticket-field-label">Date & Time</span>
                <p className="ticket-field-value">
                  {formatDate(booking.showTime?.startTime)} • {formatTime(booking.showTime?.startTime)}
                </p>
              </div>

              <div>
                <span className="ticket-field-label">Seats ({booking.selectedSeats?.length})</span>
                <p className="ticket-field-value" style={{ color: 'var(--accent-primary)', letterSpacing: '0.5px' }}>
                  {booking.selectedSeats?.map((s) => s.seatCode).join(', ')}
                </p>
              </div>

              <div>
                <span className="ticket-field-label">Total Paid</span>
                <p className="ticket-field-value">{formatCurrency(booking.totalAmount || booking.pricingBreakdown?.finalAmount || 0)}</p>
              </div>

              <div>
                <span className="ticket-field-label">Payment Status</span>
                <p className="ticket-field-value" style={{ color: 'var(--status-success)', textTransform: 'capitalize' }}>
                  {booking.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="ticket-qr-container">
            {booking.qrCodeDataUrl ? (
              <img
                src={booking.qrCodeDataUrl}
                alt="Ticket QR Code"
                className="ticket-qr-img"
              />
            ) : (
              <div style={{ width: '140px', height: '140px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>QR Processing</span>
              </div>
            )}
            <span className="ticket-qr-caption">Scan at entrance gate</span>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="ticket-perforation" />

        {/* Footer info */}
        <div style={{ padding: '1rem 2rem', background: '#13131B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color="var(--status-success)" />
            <span>HMAC Cryptographically Verified Ticket</span>
          </div>
          <span>Please carry this digital or printed pass</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
        <button onClick={handlePrint} className="btn btn-secondary btn-sm">
          <Printer size={16} />
          <span>Print / Save PDF</span>
        </button>
      </div>
    </div>
  );
};
