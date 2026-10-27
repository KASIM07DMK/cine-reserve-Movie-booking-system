import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { DigitalTicket } from '../components/bookings/DigitalTicket';
import { Loader } from '../components/common/Loader';
import { CheckCircle2, Ticket, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire celebration confetti upon mounting
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 }
    });

    if (!booking && bookingId) {
      const fetchBooking = async () => {
        try {
          const res = await bookingService.getBookingById(bookingId);
          setBooking(res.data);
        } catch (err) {
          console.error('Failed to load booking confirmation', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return <Loader size="large" text="Retrieving confirmed digital ticket..." />;
  }

  if (!booking) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Booking Not Found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(46, 173, 114, 0.15)',
            border: '2px solid var(--status-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <CheckCircle2 size={36} color="var(--status-success)" />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your seats are locked and your tickets have been generated. An entry QR code is ready below.
        </p>
      </div>

      {/* Verified Digital Ticket */}
      <DigitalTicket booking={booking} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/my-bookings" className="btn btn-primary">
          <Ticket size={18} />
          <span>Go to My Bookings</span>
        </Link>
        <Link to="/" className="btn btn-secondary">
          <Home size={18} />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
};
