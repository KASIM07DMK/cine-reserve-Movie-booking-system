import React from 'react';
import { Seat } from './Seat';
import { SeatLegend } from './SeatLegend';

export const SeatMap = ({ seats = [], selectedSeatCodes = [], onToggleSeat, seatCategories = [] }) => {
  // Map of category -> rows -> array of seats
  const groupedSeats = {};

  seats.forEach((seat) => {
    const cat = seat.category || 'Regular';
    if (!groupedSeats[cat]) groupedSeats[cat] = {};
    if (!groupedSeats[cat][seat.rowLabel]) groupedSeats[cat][seat.rowLabel] = [];
    groupedSeats[cat][seat.rowLabel].push(seat);
  });

  // Categories order: Recliner -> Premium -> Regular, plus any dynamic ones
  const baseOrder = ['Recliner', 'Premium', 'Regular'];
  const categoryOrder = [...new Set([...baseOrder.filter((c) => groupedSeats[c]), ...Object.keys(groupedSeats)])];

  return (
    <div className="seat-selection-container">
      {/* Curved Screen Indicator */}
      <div className="screen-indicator-box">
        <div className="curved-screen-bar" />
        <span className="screen-text">All Eyes This Way</span>
      </div>

      {/* Seat Layout Organized by Category */}
      <div className="seat-layout">
        {categoryOrder.map((category) => {
          const rowsObj = groupedSeats[category];
          if (!rowsObj || Object.keys(rowsObj).length === 0) return null;

          // Find sample price for this category
          const sampleSeat = Object.values(rowsObj)[0]?.[0];
          const price = sampleSeat ? sampleSeat.price : 200;

          return (
            <div key={category} style={{ marginBottom: '1.25rem' }}>
              <div className="seat-category-header">
                {category} • ₹{price}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {Object.keys(rowsObj)
                  .sort()
                  .map((rowLabel) => {
                    const rowSeats = rowsObj[rowLabel].sort((a, b) => a.seatNumber - b.seatNumber);

                    return (
                      <div key={rowLabel} className="seat-row">
                        <span className="row-label">{rowLabel}</span>
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          {rowSeats.map((seat) => (
                            <Seat
                              key={seat.seatCode || seat.id}
                              seat={seat}
                              isSelected={selectedSeatCodes.includes(seat.seatCode)}
                              onToggle={onToggleSeat}
                            />
                          ))}
                        </div>
                        <span className="row-label">{rowLabel}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <SeatLegend categories={seatCategories} />
    </div>
  );
};
