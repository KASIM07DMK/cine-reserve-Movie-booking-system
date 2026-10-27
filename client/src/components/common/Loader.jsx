import React from 'react';

export const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: '1.2rem',
    medium: '2.2rem',
    large: '3.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div
        style={{
          width: sizeClasses[size] || '2.2rem',
          height: sizeClasses[size] || '2.2rem',
          border: '3px solid rgba(229, 57, 69, 0.2)',
          borderTop: '3px solid var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
