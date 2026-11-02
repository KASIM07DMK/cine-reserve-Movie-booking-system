import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';
import { formatTime } from '../../utils/formatDate';

export const CinemaCard = ({ cinema, shows = [], onSelectShow }) => {
  const navigate = useNavigate();

  const handleShowClick = (show) => {
    if (show.availabilityState === 'Sold Out') return;
    if (onSelectShow) {
      onSelectShow(show);
    } else {
      navigate(`/shows/${show.id || show._id}/seats`);
    }
  };

  return (
    <div className="cinema-card">
      <div className="cinema-header">
        <div>
          <h3 className="cinema-title">{cinema.name}</h3>
          <p className="cinema-address">
            <MapPin size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span>
              {typeof cinema.address === 'object' && cinema.address !== null
                ? [cinema.address.street, cinema.address.area, cinema.city].filter(Boolean).join(', ')
                : (cinema.address || cinema.city || '')}
            </span>
          </p>
          {cinema.facilities && cinema.facilities.length > 0 && (
            <div className="cinema-facilities">
              {cinema.facilities.map((f, i) => (
                <span key={i} className="facility-chip">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {shows.length > 0 ? (
        <div className="showtimes-grid">
          {shows.map((show) => {
            const isSoldOut = show.availabilityState === 'Sold Out';
            const isFillingFast = show.availabilityState === 'Filling Fast';

            return (
              <button
                key={show.id || show._id}
                onClick={() => handleShowClick(show)}
                disabled={isSoldOut}
                className={`showtime-pill ${isSoldOut ? 'sold-out' : ''} ${isFillingFast ? 'filling-fast' : ''}`}
                title={`${show.language} • ${show.format} • ${show.availabilityState}`}
              >
                <span className="showtime-time">{formatTime(show.startTime)}</span>
                <span className="showtime-sub">{show.screenName ? `${show.format} • ${show.screenName.split(' - ')[0]}` : `${show.format} • ${show.language}`}</span>
                {isFillingFast && (
                  <span style={{ fontSize: '0.65rem', color: '#F5A623', fontWeight: 600, marginTop: '2px' }}>
                    Filling Fast
                  </span>
                )}
                {isSoldOut && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                    Sold Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
          No scheduled shows on this date for this cinema.
        </p>
      )}
    </div>
  );
};
