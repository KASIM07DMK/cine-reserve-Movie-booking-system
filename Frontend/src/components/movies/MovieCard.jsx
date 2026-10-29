import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Clock, Calendar } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const isUpcoming = movie.status === 'upcoming';

  return (
    <div className="movie-card">
      <Link to={`/movies/${movie.slug || movie._id}`} className="movie-card-poster">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
          }}
        />
        {movie.rating > 0 && (
          <div className="movie-card-rating">
            <Star size={13} fill="#FFC107" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
        {movie.certification && (
          <div className="movie-card-cert">{movie.certification}</div>
        )}
      </Link>

      <div className="movie-card-info">
        <Link to={`/movies/${movie.slug || movie._id}`} title={movie.title}>
          <h3 className="movie-card-title">{movie.title}</h3>
        </Link>
        <p className="movie-card-genres">{movie.genres?.join(', ')}</p>
        <p className="movie-card-languages">
          {movie.languages?.join(' • ')}
        </p>

        <div className="movie-card-action">
          {isUpcoming ? (
            <Link to={`/movies/${movie.slug || movie._id}`} className="btn btn-secondary btn-sm btn-block">
              <Calendar size={14} />
              <span>Release Info</span>
            </Link>
          ) : (
            <Link to={`/movies/${movie.slug || movie._id}`} className="btn btn-primary btn-sm btn-block">
              <Ticket size={14} />
              <span>Book Tickets</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
