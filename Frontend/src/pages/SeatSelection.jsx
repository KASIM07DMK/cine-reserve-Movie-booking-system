import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { seatService } from '../services/seatService';
import { SeatMap } from '../components/seats/SeatMap';
import { SeatTimer } from '../components/seats/SeatTimer';
import { Loader } from '../components/common/Loader';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatTime } from '../utils/formatDate';
import { ArrowLeft, Ticket, ShieldCheck, AlertCircle } from 'lucide-react';

export const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [showData, setShowData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatCodes, setSelectedSeatCodes] = useState([]);
  const [activeHold, setActiveHold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);

  const loadSeats = async () => {
    try {
      const res = await showService.getShowSeats(showId);
      setShowData(res.data?.show);
      setSeats(res.data?.seats || []);

      // If user had existing hold for this show, restore it
      const myHeldSeats = (res.data?.seats || []).filter((s) => s.isMyHold);
      if (myHeldSeats.length > 0) {
        setSelectedSeatCodes(myHeldSeats.map((s) => s.seatCode));
        setActiveHold({
          holdExpiresAt: myHeldSeats[0].holdExpiresAt
        });
      }
    } catch (err) {
      addToast(err.message || 'Failed to load seating inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
  }, [showId]);

  const handleToggleSeat = (seat) => {
    if (selectedSeatCodes.includes(seat.seatCode)) {
      setSelectedSeatCodes((prev) => prev.filter((code) => code !== seat.seatCode));
    } else {
      if (selectedSeatCodes.length >= 10) {
        addToast('You can select a maximum of 10 seats per booking.', 'warning');
        return;
      }
      setSelectedSeatCodes((prev) => [...prev, seat.seatCode]);
    }
  };

  // Calculate selected total price
  const selectedSeatsList = seats.filter((s) => selectedSeatCodes.includes(s.seatCode));
  const subtotal = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const handleProceedToCheckout = async () => {
    if (selectedSeatCodes.length === 0) {
      addToast('Please select at least one seat to continue.', 'warning');
      return;
    }

    setHolding(true);
    try {
      const res = await seatService.holdSeats(showId, selectedSeatCodes);
      const holdData = res.data;

      // Persist active hold in session storage
      sessionStorage.setItem(
        'cinereserve_current_booking',
        JSON.stringify({
          showId,
          holdId: holdData.holdId,
          holdExpiresAt: holdData.holdExpiresAt,
          seatCodes: selectedSeatCodes
        })
      );

      addToast(`${selectedSeatCodes.length} seat(s) reserved temporarily for 5 minutes.`, 'success');

      // Navigate to checkout
      navigate('/checkout', {
        state: {
          showId,
          holdId: holdData.holdId,
          holdExpiresAt: holdData.holdExpiresAt,
          seatCodes: selectedSeatCodes
        }
      });
    } catch (err) {
      addToast(err.message || 'Selected seats are no longer available. Refreshing layout...', 'error');
      // Reload seat status
      await loadSeats();
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return <Loader size="large" text="Generating interactive cinema auditorium..." />;
  }

  if (!showData) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Showtime Not Available</h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ paddingTop: '1.5rem' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{showData.movie?.title}</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {showData.cinema?.name} ({showData.screen?.name || 'Screen 1'}) • {showData.language} {showData.format}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              {formatDate(showData.startTime)}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {formatTime(showData.startTime)}
            </p>
          </div>

          {activeHold?.holdExpiresAt && (
            <SeatTimer
              expiresAt={activeHold.holdExpiresAt}
              onExpire={() => {
                addToast('Your seat hold has expired. Please reselect your seats.', 'error');
                setActiveHold(null);
                setSelectedSeatCodes([]);
                loadSeats();
              }}
            />
          )}
        </div>
      </div>

      {/* Interactive Seat Layout */}
      <SeatMap
        seats={seats}
        selectedSeatCodes={selectedSeatCodes}
        onToggleSeat={handleToggleSeat}
        seatCategories={showData.screen?.seatCategories}
      />

      {/* Sticky Bottom Booking Action Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'rgba(22, 22, 29, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-subtle)',
          margin: '2rem -1.5rem 0',
          padding: '1.25rem 2rem',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.7)',
          zIndex: 50
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', padding: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Seats:</span>
              <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>
                {selectedSeatCodes.length > 0 ? selectedSeatCodes.join(', ') : 'None selected'}
              </strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedSeatCodes.length} seat(s) selected (max 10 allowed)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subtotal</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatCurrency(subtotal)}
              </p>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeatCodes.length === 0 || holding}
              className="btn btn-primary btn-lg"
            >
              <Ticket size={18} />
              <span>{holding ? 'Locking Seats...' : 'Confirm & Proceed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
