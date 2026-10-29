import React from 'react';

export const Seat = ({ seat, isSelected, onToggle }) => {
  if (seat.isAisle) {
    return <div className="seat-item aisle" />;
  }

  const isBooked = seat.status === 'booked' || seat.status === 'blocked';
  const isHeldByOther = seat.status === 'held' && !seat.isMyHold && !isSelected;

  const handleClick = () => {
    if (isBooked || isHeldByOther) return;
    onToggle(seat);
  };

  const getStatusClass = () => {
    if (isSelected || seat.isMyHold) return 'selected';
    if (isBooked) return 'booked';
    if (isHeldByOther) return 'held';
    return 'available';
  };

  return (
    <div
      className={`seat-item ${getStatusClass()}`}
      onClick={handleClick}
      title={`${seat.seatCode} • ${seat.category} (₹${seat.price}) - ${
        isSelected ? 'Selected' : isBooked ? 'Booked' : isHeldByOther ? 'Currently Reserved' : 'Available'
      }`}
    >
      {seat.seatNumber}
    </div>
  );
};
