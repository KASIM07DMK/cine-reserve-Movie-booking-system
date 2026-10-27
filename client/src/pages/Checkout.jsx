import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { BookingSummary } from '../components/bookings/BookingSummary';
import { SeatTimer } from '../components/seats/SeatTimer';
import { Loader } from '../components/common/Loader';
import { formatCurrency } from '../utils/formatCurrency';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'hdfc', color: '#004c8f' },
  { id: 'SBI', name: 'State Bank of India', code: 'sbi', color: '#280071' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'icici', color: '#b02a30' },
  { id: 'AXIS', name: 'Axis Bank', code: 'axis', color: '#97144d' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'kotak', color: '#ed1c24' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'pnb', color: '#a20a3a' }
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Yes Bank',
  'Federal Bank',
  'IDFC FIRST Bank',
  'Indian Bank',
  'Central Bank of India'
];

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [bookingParams, setBookingParams] = useState(() => {
    if (location.state?.showId && location.state?.holdId) {
      return location.state;
    }
    const saved = sessionStorage.getItem('cinereserve_current_booking');
    return saved ? JSON.parse(saved) : null;
  });

  const [previewData, setPreviewData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [gatewayStep, setGatewayStep] = useState(null); // 'connecting' | 'authorizing' | 'confirming' | 'success'

  // Contact info
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Payment method: 'UPI' | 'CARD' | 'NETBANKING'
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Method specific state
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [otherBank, setOtherBank] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 8920 1823 4819');
  const [cardName, setCardName] = useState(user?.name || 'Rahul Sharma');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('834');

  const loadPreview = async (appliedCode = null) => {
    if (!bookingParams) return;
    try {
      const res = await bookingService.previewBooking({
        showId: bookingParams.showId,
        holdId: bookingParams.holdId,
        couponCode: appliedCode
      });
      setPreviewData(res.data);
      if (res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
      }
    } catch (err) {
      addToast(err.message || 'Seat reservation has expired. Please select seats again.', 'error');
      navigate(`/shows/${bookingParams.showId}/seats`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingParams?.showId || !bookingParams?.holdId) {
      navigate('/movies');
      return;
    }
    loadPreview();
  }, [bookingParams]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await loadPreview(couponCode.trim().toUpperCase());
      addToast('Promo coupon applied successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Invalid coupon code.', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setAppliedCoupon(null);
    await loadPreview(null);
    addToast('Coupon removed.', 'info');
  };

  const handleFormatCardNumber = (e) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  const handleFillDemoCard = () => {
    setCardNumber('4532 8920 1823 4819');
    setCardName(name || 'Rahul Sharma');
    setCardExpiry('12/28');
    setCardCvv('834');
    addToast('Demo card details auto-filled.', 'info');
  };

  const executePayment = async (selectedMethodLabel) => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      addToast('Please enter a valid email address for your digital ticket.', 'warning');
      return;
    }
    if (!name.trim()) {
      addToast('Please enter your full name.', 'warning');
      return;
    }

    setProcessingPayment(true);
    setGatewayStep('connecting');

    try {
      // Step 1: Create pending booking in DB
      const bookingRes = await bookingService.createBooking({
        showId: bookingParams.showId,
        holdId: bookingParams.holdId,
        seatCodes: bookingParams.seatCodes,
        couponCode: appliedCoupon?.code || null,
        guestDetails: { name, email, phone }
      });
      const createdBooking = bookingRes.data;

      setGatewayStep('authorizing');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Create payment order with backend
      const orderRes = await paymentService.createOrder({
        bookingId: createdBooking._id,
        customerEmail: email
      });
      const orderData = orderRes.data;

      setGatewayStep('confirming');
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Step 3: Verify payment and atomically confirm seats & generate digital ticket
      const testPaymentId = `pay_test_${Date.now()}`;
      const verifyRes = await paymentService.verifyPayment({
        bookingId: createdBooking._id,
        providerOrderId: orderData.providerOrderId,
        providerPaymentId: testPaymentId,
        signature: orderData.signature,
        paymentMethod: selectedMethodLabel
      });

      setGatewayStep('success');
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Clear session storage
      sessionStorage.removeItem('cinereserve_current_booking');

      // Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 }
      });

      addToast('Payment successful! Your tickets are confirmed.', 'success');

      // Route to booking confirmation
      navigate(`/booking-confirmation/${createdBooking._id}`, {
        state: { booking: verifyRes.data?.booking }
      });
    } catch (err) {
      console.error('Payment execution failed', err);
      addToast(err.message || 'Payment processing error. Please try again.', 'error');
      setGatewayStep(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    let methodLabel = 'UPI (QR Code)';
    if (paymentMethod === 'UPI') {
      methodLabel = `UPI (${upiApp} - ${upiId})`;
    } else if (paymentMethod === 'CARD') {
      methodLabel = `Card (ending in ${cardNumber.slice(-4) || '4819'})`;
    } else if (paymentMethod === 'NETBANKING') {
      methodLabel = `NetBanking (${selectedBank || otherBank || 'HDFC Bank'})`;
    }
    executePayment(methodLabel);
  };

  if (loading || !previewData) {
    return <Loader size="large" text="Preparing checkout invoice..." />;
  }

  const finalAmount = previewData.pricing.finalAmount;

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2rem', position: 'relative' }}>
      {/* Active Gateway Simulator Modal */}
      {processingPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 10, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#15151D',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(229, 9, 20, 0.25)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: gatewayStep === 'success' ? 'rgba(46, 173, 114, 0.2)' : 'rgba(229, 9, 20, 0.15)',
                border: `2px solid ${gatewayStep === 'success' ? '#2EAD72' : 'var(--accent-primary)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                position: 'relative'
              }}
            >
              {gatewayStep === 'success' ? (
                <CheckCircle2 size={36} color="#2EAD72" />
              ) : (
                <RefreshCw size={32} color="var(--accent-primary)" style={{ animation: 'spin 1.2s linear infinite' }} />
              )}
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              {gatewayStep === 'connecting' && 'Connecting to Gateway...'}
              {gatewayStep === 'authorizing' && 'Simulating Bank Authorization...'}
              {gatewayStep === 'confirming' && 'Locking Seats & Generating Ticket...'}
              {gatewayStep === 'success' && 'Payment Approved!'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {gatewayStep === 'connecting' && 'Establishing 256-bit SSL encrypted tunnel with payment provider.'}
              {gatewayStep === 'authorizing' && `Verifying ${formatCurrency(finalAmount)} transaction token.`}
              {gatewayStep === 'confirming' && 'Assigning seat inventory and generating entrance QR pass.'}
              {gatewayStep === 'success' && 'Your reservation has been confirmed. Redirecting to your ticket...'}
            </p>

            <div style={{ background: '#1C1C26', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Amount Payable</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--accent-primary)' }}>{formatCurrency(finalAmount)}</strong>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="#2EAD72" />
              <span>PCI-DSS Level 1 & RBI Compliant Simulation</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Confirm & Checkout</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Choose your preferred payment method to generate verified digital tickets
          </p>
        </div>

        {previewData.holdExpiresAt && (
          <SeatTimer
            expiresAt={previewData.holdExpiresAt}
            onExpire={() => {
              addToast('Reservation expired. Please choose seats again.', 'error');
              navigate(`/shows/${bookingParams.showId}/seats`);
            }}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Contact + Interactive Payment Window */}
        <div>
          <form onSubmit={handleCheckoutSubmit}>
            {/* Contact Details Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Contact Information
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Your digital ticket and gate QR code will be issued to these details.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* INTERACTIVE PAYMENT WINDOW */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                marginBottom: '1.75rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {/* Payment Method Selector Tabs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: '#121217',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {[
                  { id: 'UPI', label: 'UPI / QR Code', icon: <QrCode size={18} /> },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                  { id: 'NETBANKING', label: 'NetBanking', icon: <Building2 size={18} /> }
                ].map((tab) => {
                  const isActive = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id)}
                      style={{
                        padding: '1.1rem 0.75rem',
                        background: isActive ? 'var(--bg-card)' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                        border: 'none',
                        borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: UPI & QR CODE SIMULATOR */}
              {paymentMethod === 'UPI' && (
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'center' }}>
                    {/* Visual QR Code Card */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: '180px',
                          height: '180px',
                          margin: '0 auto',
                          background: 'radial-gradient(circle at center, #222 25%, #000 70%)',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1rem',
                          color: '#FFF',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <QrCode size={110} color="#FFFFFF" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, marginTop: '0.4rem', color: '#FFD700', letterSpacing: '0.5px' }}>
                          CineReserve UPI
                        </span>
                        {/* Animated Scan Line */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: '#2EAD72',
                            boxShadow: '0 0 10px #2EAD72, 0 0 20px #2EAD72',
                            animation: 'bounce 2.5s ease-in-out infinite'
                          }}
                        />
                      </div>

                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2EAD72', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333' }}>
                          Scan to Pay {formatCurrency(finalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* UPI App Options & VPA Input */}
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Pay via Any UPI App
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Scan the QR code or approve the request on your favorite app:
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        {['Google Pay', 'PhonePe', 'Paytm', 'CRED'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setUpiApp(app)}
                            style={{
                              padding: '0.6rem 0.4rem',
                              borderRadius: '8px',
                              background: upiApp === app ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                              border: `1px solid ${upiApp === app ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                              color: upiApp === app ? '#FFFFFF' : 'var(--text-secondary)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Smartphone size={16} color={upiApp === app ? 'var(--accent-primary)' : 'inherit'} />
                            <span>{app}</span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                          Or Enter UPI VPA ID
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okaxis"
                            style={{ flex: 1, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD WINDOW */}
              {paymentMethod === 'CARD' && (
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '2rem', alignItems: 'center' }}>
                    {/* Visual Realistic Credit Card */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #1C1C28 0%, #291016 50%, #400A14 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        aspectRatio: '1.58 / 1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.6), 0 0 20px rgba(229, 9, 20, 0.25)',
                        color: '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px' }}>
                          CINERESERVE VIP
                        </span>
                        <CreditCard size={22} color="var(--accent-primary)" />
                      </div>

                      {/* Chip Icon */}
                      <div
                        style={{
                          width: '38px',
                          height: '28px',
                          background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                          borderRadius: '5px',
                          border: '1px solid #7c5c00'
                        }}
                      />

                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '2.5px', fontFamily: 'monospace' }}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)' }}>CARDHOLDER</span>
                            <span>{cardName || 'YOUR NAME'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)' }}>EXPIRES</span>
                            <span>{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Form Inputs */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Card Details</span>
                        <button
                          type="button"
                          onClick={handleFillDemoCard}
                          style={{
                            background: 'rgba(229, 9, 20, 0.15)',
                            border: '1px solid rgba(229, 9, 20, 0.35)',
                            color: 'var(--accent-primary)',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Auto-Fill Demo Card
                        </button>
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          maxLength={19}
                          onChange={handleFormatCardNumber}
                          placeholder="4532 8920 1823 4819"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on Card"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            maxLength={5}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            maxLength={4}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NETBANKING SIMULATOR */}
              {paymentMethod === 'NETBANKING' && (
                <div style={{ padding: '1.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Select Your Bank
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    We will simulate instant authentication with your bank's secure portal:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {POPULAR_BANKS.map((b) => {
                      const isBankSelected = selectedBank === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBank(b.id);
                            setOtherBank('');
                          }}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: isBankSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                            border: `1px solid ${isBankSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: b.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFF',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}
                          >
                            {b.id[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isBankSelected ? '#FFFFFF' : 'var(--text-main)' }}>
                              {b.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Or Choose from Other Indian Banks
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => {
                        setOtherBank(e.target.value);
                        setSelectedBank('');
                      }}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#FFF' }}
                    >
                      <option value="">-- Choose Other Bank --</option>
                      {OTHER_BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Bar inside Payment Window */}
              <div
                style={{
                  background: '#121217',
                  borderTop: '1px solid var(--border-subtle)',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <ShieldCheck size={18} color="#2EAD72" />
                  <span>256-Bit Bank Grade Encryption</span>
                </div>

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '240px', padding: '0.9rem 1.5rem', fontSize: '1.05rem', fontWeight: 800 }}
                >
                  <Lock size={18} />
                  <span>
                    {processingPayment ? 'Authorizing Payment...' : `Complete Payment • ${formatCurrency(finalAmount)}`}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Real-Time Ticket Summary */}
        <aside>
          <BookingSummary
            movie={previewData.movie}
            cinema={previewData.cinema}
            show={previewData.show}
            selectedSeats={previewData.seats}
            pricing={previewData.pricing}
            coupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponLoading={couponLoading}
          />
        </aside>
      </div>
    </div>
  );
};
