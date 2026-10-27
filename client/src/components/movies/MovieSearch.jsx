import React from 'react';
import { Search, X } from 'lucide-react';

export const MovieSearch = ({ value, onChange, placeholder = 'Search movies, genres, or directors...' }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '1.1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.85rem 2.8rem 0.85rem 3rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.95rem'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
