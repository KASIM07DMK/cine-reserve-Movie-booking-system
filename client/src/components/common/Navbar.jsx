import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { Clapperboard, MapPin, ChevronDown, User, Ticket, LayoutDashboard, LogOut, Menu, X, Tag } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { selectedCity, openCityModal } = useCity();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" title="CineReserve - Luxury Cinema Booking">
          <img src="/logo.jpg" alt="CineReserve Logo" className="brand-logo-img" />
          <span>Cine<span className="accent-word">Reserve</span></span>
        </Link>

        {/* City Selector Trigger */}
        <button className="city-pill-btn" onClick={openCityModal} title="Change city">
          <MapPin size={16} color="var(--accent-primary)" />
          <span>{selectedCity?.name || 'Select City'}</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Movies
          </NavLink>
          <NavLink to="/cinemas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Cinemas
          </NavLink>
          <NavLink to="/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Offers
          </NavLink>
        </nav>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.4rem 0.8rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '210px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 100,
                    animation: 'slideUp 0.15s ease-out'
                  }}
                >
                  <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Ticket size={16} color="var(--accent-primary)" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        color: '#F5A623',
                        fontWeight: 600,
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LayoutDashboard size={16} />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      color: 'var(--status-danger)',
                      textAlign: 'left',
                      marginTop: '0.2rem',
                      borderTop: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(229,57,69,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: '#FFFFFF', padding: '0.4rem' }}
            className="mobile-nav-toggle"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <Link to="/movies" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
            Movies
          </Link>
          <Link to="/cinemas" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
            Cinemas
          </Link>
          <Link to="/offers" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
            Offers
          </Link>
          {user && (
            <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
              My Bookings
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
