import React from 'react';
import { MovieCard } from './MovieCard';
import { Film } from 'lucide-react';

export const MovieGrid = ({ movies = [], loading = false }) => {
  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="movie-card" style={{ height: '380px' }}>
            <div className="skeleton" style={{ height: '260px' }} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="skeleton" style={{ height: '18px', width: '80%' }} />
              <div className="skeleton" style={{ height: '14px', width: '50%' }} />
              <div className="skeleton" style={{ height: '32px', width: '100%', marginTop: 'auto' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
        <Film size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Movies Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Try adjusting your search query, city, or filter options to discover other films.
        </p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
};
