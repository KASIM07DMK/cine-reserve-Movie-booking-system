import React from 'react';

export const MovieFilters = ({
  selectedGenre,
  onSelectGenre,
  selectedLanguage,
  onSelectLanguage,
  selectedStatus,
  onSelectStatus,
  onReset
}) => {
  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Horror', 'Adventure', 'Fantasy', 'Crime'];
  const languages = ['All', 'Telugu', 'Hindi', 'English', 'Tamil', 'Malayalam'];
  const statuses = [
    { label: 'All Movies', value: 'All' },
    { label: 'Now Showing', value: 'now_showing' },
    { label: 'Upcoming Releases', value: 'upcoming' }
  ];

  return (
    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filters</h3>
        <button
          onClick={onReset}
          style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Reset All
        </button>
      </div>

      {/* Release Status */}
      <div>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
          Status
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {statuses.map((s) => {
            const isSelected = selectedStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onSelectStatus(s.value)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--accent-primary)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.88rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
          Languages
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 400
                }}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres */}
      <div>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
          Genres
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {genres.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => onSelectGenre(g)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 400
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
