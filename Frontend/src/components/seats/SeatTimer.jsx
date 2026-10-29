import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const SeatTimer = ({ expiresAt, onExpire }) => {
  const calculateRemaining = () => {
    if (!expiresAt) return 0;
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);

  useEffect(() => {
    setTimeLeft(calculateRemaining());
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (timeLeft <= 0) {
    return (
      <div className="hold-timer-badge" style={{ background: 'rgba(229, 57, 69, 0.15)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}>
        <Clock size={16} />
        <span>Reservation Expired</span>
      </div>
    );
  }

  return (
    <div className="hold-timer-badge">
      <Clock size={16} />
      <span>Time Remaining: {formatted}</span>
    </div>
  );
};
