import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useCity } from '../context/CityContext';
import { ShowtimeSelector } from '../components/cinemas/ShowtimeSelector';
import { CinemaCard } from '../components/cinemas/CinemaCard';
import { Loader } from '../components/common/Loader';
import { Modal } from '../components/common/Modal';
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  Film,
  Flame,
  Users,
  Sparkles,
  CheckCircle2,
  Ticket,
  TrendingUp,
  Compass
} from 'lucide-react';

const getYoutubeEmbedUrl = (url, autoplay = false, mute = false) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const videoId = match ? match[1] : '';
  if (!videoId) return url.replace('watch?v=', 'embed/');
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1'
  });
  if (autoplay) {
    params.set('autoplay', '1');
    if (mute) {
      params.set('mute', '1');
    }
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export const MovieDetails = () => {
  const { movieId, idOrSlug } = useParams();
  const activeId = idOrSlug || movieId;
  const { selectedCity, selectCity, cities, openCityModal } = useCity();
  const [movie, setMovie] = useState(null);
  const [cinemasWithShows, setCinemasWithShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [dateShowCounts, setDateShowCounts] = useState({});
  const [inlineTrailerActive, setInlineTrailerActive] = useState(false);
  const [viewAllCities, setViewAllCities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [liveBookingIndex, setLiveBookingIndex] = useState(0);
  const navigate = useNavigate();

  // Simulated live ticket activity ticker for realistic real-time theater booking experience
  const liveBookings = [
    { user: 'Suresh K.', seats: '2 Recliner Seats', city: 'Hyderabad', theatre: "Prasad's Multiplex", time: 'Just now' },
    { user: 'Deepika R.', seats: '3 Premium Seats', city: 'Bengaluru', theatre: 'PVR Forum Koramangala', time: '1m ago' },
    { user: 'Vikram M.', seats: '4 Regular Seats', city: 'Mumbai', theatre: 'INOX Megaplex Inorbit', time: '2m ago' },
    { user: 'Karthik N.', seats: '2 IMAX 3D Seats', city: 'Chennai', theatre: 'SPI Palazzo Nexus', time: '3m ago' },
    { user: 'Ananya P.', seats: '2 Premium Seats', city: 'Hyderabad', theatre: 'AMB Cinemas Gachibowli', time: '4m ago' },
    { user: 'Rajesh V.', seats: '3 Recliner Seats', city: 'Vijayawada', theatre: 'PVP Square Cinepolis', time: '5m ago' }
  ];

  // Rotate ticker every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveBookingIndex((prev) => (prev + 1) % liveBookings.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveBookings.length]);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const movieRes = await movieService.getMovieDetails(activeId);
        const currentMovie = movieRes.data;
        setMovie(currentMovie);

        // Auto-activate inline trailer for Ranabali
        const isRanabali = currentMovie.slug === 'ranabali' || currentMovie.title?.toLowerCase().includes('ranabali');
        if (isRanabali) {
          setInlineTrailerActive(true);
        }

        // Default to movie's primary language if not yet set
        const activeLang = selectedLanguage || currentMovie.languages?.[0] || 'All';
        if (!selectedLanguage && currentMovie.languages?.length > 0) {
          setSelectedLanguage(currentMovie.languages[0]);
        }

        // Load showtimes for selected city (or all cities if viewAllCities is enabled)
        const cityFilter = viewAllCities ? null : selectedCity?._id;
        const showsRes = await movieService.getMovieShows(currentMovie._id, {
          cityId: cityFilter,
          date: selectedDate,
          language: activeLang !== 'All' ? activeLang : undefined
        });

        setDateShowCounts(showsRes.data?.dateShowCounts || {});
        let loadedCinemas = showsRes.data?.cinemas || [];

        // If specific city produced 0 shows, automatically fallback to all theatres
        if (loadedCinemas.length === 0 && selectedCity) {
          const fallbackRes = await movieService.getMovieShows(currentMovie._id, {
            date: selectedDate,
            language: activeLang !== 'All' ? activeLang : undefined
          });
          loadedCinemas = fallbackRes.data?.cinemas || [];
          if (!showsRes.data?.dateShowCounts || Object.keys(showsRes.data.dateShowCounts).length === 0) {
            setDateShowCounts(fallbackRes.data?.dateShowCounts || {});
          }
        }

        setCinemasWithShows(loadedCinemas);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeId) {
      loadDetails();
    }
  }, [activeId, selectedCity, selectedDate, selectedLanguage, viewAllCities]);

  if (loading && !movie) {
    return <Loader size="large" text="Loading movie details and running theatres..." />;
  }

  if (!movie) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Movie Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>The requested movie could not be located.</p>
        <Link to="/movies" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  // Filter shows by format and individual film language
  const filteredCinemas = cinemasWithShows
    .map((item) => ({
      ...item,
      shows: item.shows.filter((s) => {
        const matchesFormat = selectedFormat === 'All' || s.format === selectedFormat;
        const matchesLanguage = !selectedLanguage || selectedLanguage === 'All' || s.language === selectedLanguage;
        return matchesFormat && matchesLanguage;
      })
    }))
    .filter((item) => item.shows.length > 0);

  const activeTicker = liveBookings[liveBookingIndex];

  return (
    <div>
      {/* Movie Hero Banner */}
      <div style={{ position: 'relative', minHeight: '460px', background: '#0D0D11', overflow: 'hidden' }}>
        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(12px) brightness(0.24)',
              transform: 'scale(1.05)'
            }}
          />
        )}
        {/* Dark gradient & Movie Logo watermark in background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(13,13,17,0.3) 0%, rgba(16,16,20,0.95) 75%, rgba(16,16,20,1) 100%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '4%',
            bottom: '8%',
            width: '420px',
            height: '420px',
            backgroundImage: `url(${movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            filter: 'blur(2px) grayscale(30%)',
            borderRadius: 'var(--radius-xl)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '3.5rem 1.5rem 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
            {/* Poster Card */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(229, 9, 20, 0.2)',
                border: '1px solid rgba(255,255,255,0.12)',
                position: 'relative'
              }}
            >
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
                }}
                style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '2/3', objectFit: 'cover' }}
              />
              {movie.isFeatured && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--accent-primary)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    textTransform: 'uppercase'
                  }}
                >
                  Trending
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(229, 9, 20, 0.15)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(229, 9, 20, 0.3)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Now Screening in Theatres
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Released {new Date(movie.releaseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h1 style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                {movie.title}
              </h1>

              {/* Badges / Ratings */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                {movie.rating > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#FFC107',
                      fontWeight: 800,
                      background: 'rgba(255, 193, 7, 0.12)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 193, 7, 0.25)'
                    }}
                  >
                    <Star size={17} fill="#FFC107" />
                    <span>{movie.rating.toFixed(1)} / 10</span>
                  </div>
                )}
                <span style={{ border: '1px solid var(--border-subtle)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(255,255,255,0.04)' }}>
                  {movie.certification}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={16} color="var(--accent-primary)" />
                  <span>{movie.durationMinutes} mins</span>
                </span>
                <span>•</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{movie.languages?.join(', ')}</span>
              </div>

              {/* Genre Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                {movie.genres?.map((g) => (
                  <span
                    key={g}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '0.3rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#E0E0E0'
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p style={{ color: '#D0D0DE', fontSize: '0.98rem', lineHeight: '1.65', maxWidth: '780px' }}>
                {movie.description}
              </p>

              {/* Cast & Crew Details */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                {movie.director && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Director
                    </span>
                    <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{movie.director}</strong>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Starring Cast
                    </span>
                    <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{movie.cast.join(', ')}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.8rem' }}>
                <a
                  href="#theatres-section"
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1.6rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(229, 9, 20, 0.5)'
                  }}
                >
                  <Ticket size={18} />
                  <span>Book Tickets Now</span>
                </a>

                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem 1.4rem',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      fontWeight: 700
                    }}
                  >
                    <Play size={18} fill="#FFFFFF" />
                    <span>Watch Fullscreen HD</span>
                  </button>
                )}
              </div>

              {/* Requirement 1: Embedded Video of Trailer with Movie Logo Artwork in Background */}
              {movie.trailerUrl && (
                <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '640px' }}>
                  <div
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(229,9,20,0.3)',
                      border: '1.5px solid rgba(229,9,20,0.45)',
                      background: '#0E0E14'
                    }}
                  >
                    <div style={{ position: 'relative', paddingBottom: '50%', height: 0 }}>
                      <iframe
                        src={getYoutubeEmbedUrl(movie.trailerUrl, false)}
                        title={`${movie.title} - Official Video Trailer`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <div style={{ background: '#12121A', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={movie.posterUrl}
                          alt={`${movie.title} logo`}
                          style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #FFC107' }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFF' }}>
                          {movie.title} — Official Video Trailer
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#FFC107', fontWeight: 800 }}>
                        HD 1080p
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME BOOKING SECTION & LIVE TICKET ACTIVITY */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(229, 9, 20, 0.1) 0%, rgba(26, 26, 36, 0.95) 50%, rgba(229, 9, 20, 0.1) 100%)',
          borderTop: '1px solid rgba(229, 9, 20, 0.3)',
          borderBottom: '1px solid rgba(229, 9, 20, 0.3)',
          padding: '1rem 0'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Pulsing Live Activity Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(229, 9, 20, 0.2)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(229, 9, 20, 0.4)' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#2EAD72',
                  display: 'inline-block',
                  boxShadow: '0 0 10px #2EAD72'
                }}
              />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                LIVE BOOKING ACTIVITY
              </span>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#E0E0F0' }}>
              <strong style={{ color: '#FFF' }}>{activeTicker.user}</strong> booked <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{activeTicker.seats}</span> at <em>{activeTicker.theatre}</em> ({activeTicker.city}) • <span style={{ color: 'var(--text-muted)' }}>{activeTicker.time}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2EAD72', fontWeight: 700 }}>
              <Flame size={16} />
              <span>86% Filling Fast</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D0D0DE' }}>
              <TrendingUp size={16} color="var(--accent-primary)" />
              <span>1,420+ Tickets Booked Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Shows & Prescribed City Section */}
      <div id="theatres-section" className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Select Cinema & Showtime</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Showing running theatres in <strong style={{ color: '#FFFFFF' }}>{viewAllCities ? 'All Cities' : selectedCity?.name || 'Your City'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button
              onClick={() => setViewAllCities(!viewAllCities)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: viewAllCities ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: viewAllCities ? 'var(--accent-subtle)' : 'var(--bg-card)',
                color: viewAllCities ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: 600
              }}
            >
              <Compass size={14} />
              <span>{viewAllCities ? 'Filtered to City' : 'Show All Theatres (16+)'}</span>
            </button>

            <button onClick={openCityModal} className="btn btn-secondary btn-sm">
              <MapPin size={14} color="var(--accent-primary)" />
              <span>Change City ({selectedCity?.name})</span>
            </button>
          </div>
        </div>

        {/* Quick City Selector Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
            Prescribed City:
          </span>
          <button
            onClick={() => {
              setViewAllCities(true);
            }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: viewAllCities ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: viewAllCities ? '#FFF' : 'var(--text-secondary)',
              border: `1px solid ${viewAllCities ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Cities ({cinemasWithShows.length} Theatres)
          </button>

          {cities.slice(0, 8).map((city) => {
            const isCitySelected = !viewAllCities && selectedCity?._id === city._id;
            return (
              <button
                key={city._id}
                onClick={() => {
                  setViewAllCities(false);
                  selectCity(city);
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: isCitySelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: isCitySelected ? '#FFF' : 'var(--text-secondary)',
                  border: `1px solid ${isCitySelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* District-style Date & Language Showtime Selector */}
        <ShowtimeSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          languages={movie?.languages || []}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          dateShowCounts={dateShowCounts}
        />

        {/* Current Filter Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0.6rem 1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.88rem', color: '#E2E2F0' }}>
            Showing <strong>{filteredCinemas.reduce((acc, c) => acc + c.shows.length, 0)}</strong> showtime(s) in <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedLanguage || 'All'}</span> ({selectedFormat})
          </span>
          <span style={{ fontSize: '0.78rem', color: '#2EAD72', fontWeight: 700 }}>
            ● Verified Real-Time Auditoriums
          </span>
        </div>

        {/* Running Theatres List */}
        <div>
          {filteredCinemas.length > 0 ? (
            filteredCinemas.map((item) => (
              <CinemaCard
                key={item.cinema.id || item.cinema._id}
                cinema={item.cinema}
                shows={item.shows}
                onSelectShow={(show) => navigate(`/shows/${show.id || show._id}/seats`)}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
              <Film size={44} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Screenings in {selectedCity?.name} on this Date</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Shows for {movie.title} are currently running in other nearby theatres. Click below to view all running theatres.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setViewAllCities(true)}
                  className="btn btn-primary btn-sm"
                >
                  View Theatres in All Cities
                </button>
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="btn btn-secondary btn-sm"
                >
                  Check Today's Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && movie.trailerUrl && (
        <Modal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={`${movie.title} - Official Trailer`}
          maxWidth="840px"
        >
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
            <iframe
              src={getYoutubeEmbedUrl(movie.trailerUrl, true, false)}
              title={movie.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
