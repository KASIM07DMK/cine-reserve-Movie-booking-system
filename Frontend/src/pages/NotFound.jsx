import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '60vh' }}>
      <Film size={64} color="var(--accent-primary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Scene Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '2rem' }}>
        The page you are looking for has been cut from the final reel or does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};
