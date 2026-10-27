import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { DigitalTicket } from '../components/bookings/DigitalTicket';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../components/common/Toast';
import { formatDate, formatTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, Eye, XCircle } from 'lucide-react';

export const MyBookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch your bookings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    const showStart = new Date(b.showTime?.startTime);
    return showStart >= now && b.bookingStatus === 'confirmed';
  });

  const pastBookings = bookings.filter((b) => {
    const showStart = new Date(b.showTime?.startTime);
    return showStart < now || b.bookingStatus === 'cancelled';
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(cancelModalBooking._id, 'Customer requested cancellation via portal');
      addToast('Booking cancelled successfully. Refund initiated.', 'success');
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          Access your digital passes, show details, and booking receipts
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'upcoming' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'upcoming' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Upcoming Shows ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'past' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'past' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Past & Cancelled ({pastBookings.length})
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Retrieving your bookings..." />
      ) : displayedBookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedBookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'confirmed';
            const isCancelled = b.bookingStatus === 'cancelled';

            return (
              <div
                key={b._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  {b.movieSnapshot?.posterUrl && (
                    <img
                      src={b.movieSnapshot.posterUrl}
                      alt={b.movieSnapshot.title}
                      style={{ width: '70px', height: '95px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isConfirmed ? 'rgba(46,173,114,0.15)' : 'rgba(229,57,69,0.15)',
                          color: isConfirmed ? 'var(--status-success)' : 'var(--status-danger)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {b.bookingStatus}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {b.bookingReference}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{b.movieSnapshot?.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {b.cinemaSnapshot?.name} ({b.cinemaSnapshot?.screenName || 'Audi 1'})
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatDate(b.showTime?.startTime)} • {formatTime(b.showTime?.startTime)}
                    </p>
                  </div>
                </div>

                {/* Seats and Total */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                      Seats ({b.selectedSeats?.length})
                    </span>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                      {b.selectedSeats?.map((s) => s.seatCode).join(', ')}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                      Total Paid
                    </span>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {formatCurrency(b.totalAmount)}
                    </strong>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {isConfirmed && (
                      <button
                        onClick={() => setSelectedTicketBooking(b)}
                        className="btn btn-primary btn-sm"
                      >
                        <Eye size={15} />
                        <span>View Ticket</span>
                      </button>
                    )}

                    {isConfirmed && activeTab === 'upcoming' && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--status-danger)' }}
                      >
                        <XCircle size={15} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
          <Ticket size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Browse our now showing movies and reserve your cinema tickets!
          </p>
          <Link to="/movies" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Explore Movies
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicketBooking && (
        <Modal
          isOpen={Boolean(selectedTicketBooking)}
          onClose={() => setSelectedTicketBooking(null)}
          title="Digital Movie Ticket"
          maxWidth="700px"
        >
          <DigitalTicket booking={selectedTicketBooking} />
        </Modal>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={Boolean(cancelModalBooking)}
          onClose={() => setCancelModalBooking(null)}
          title="Cancel Movie Ticket"
          maxWidth="500px"
        >
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(229,57,69,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <AlertCircle size={20} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', lineHeight: '1.4' }}>
                Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> for <strong>{cancelModalBooking.movieSnapshot?.title}</strong>?
              </p>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Note: Full refund of <strong>{formatCurrency(cancelModalBooking.totalAmount)}</strong> will be credited to your original payment method. Cancellations are permitted up to 2 hours before showtime.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="btn btn-secondary btn-sm"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--status-danger)' }}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
