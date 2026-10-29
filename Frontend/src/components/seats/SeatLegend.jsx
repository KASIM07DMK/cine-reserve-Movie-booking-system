import React from 'react';

export const SeatLegend = ({ categories = [] }) => {
  return (
    <div className="seat-legend">
      <div className="legend-item">
        <div className="legend-box" style={{ background: '#1A1A24', border: '1.5px solid rgba(46, 173, 114, 0.7)' }} />
        <span>Available</span>
      </div>
      <div className="legend-item">
        <div className="legend-box" style={{ background: '#2EAD72', border: '1.5px solid #34D399' }} />
        <span>Selected</span>
      </div>
      <div className="legend-item">
        <div className="legend-box" style={{ background: '#78350F', border: '1.5px solid #F59E0B' }} />
        <span>In Other Cart</span>
      </div>
      <div className="legend-item">
        <div className="legend-box" style={{ background: '#20202A', border: '1.5px solid rgba(255,255,255,0.06)' }} />
        <span>Sold Out</span>
      </div>
    </div>
  );
};
