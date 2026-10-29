import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { cinemaService } from '../services/cinemaService';
import { useCity } from '../context/CityContext';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Star, Play, Ticket, MapPin, Sparkles, ArrowRight, ShieldCheck, Flame, TrendingUp, Film } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const Home = () => {
  const { selectedCity, openCityModal } = useCity();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerModalMovie, setTrailerModalMovie] = useState(null);
  const [liveBookingIdx, setLiveBookingIdx] = useState(0);
  const navigate = useNavigate();

  const liveFeed = [
    { user: 'Suresh K.', seats: '2 Recliner Seats', movie: 'Jailer 2', city: 'Hyderabad', theatre: "Prasad's Multiplex" },
    { user: 'Deepika R.', seats: '3 Premium Seats', movie: 'Pushpa 2: The Rule', city: 'Bengaluru', theatre: 'PVR Forum Koramangala' },
    { user: 'Vikram M.', seats: '4 Regular Seats', movie: 'Ranabali', city: 'Mumbai', theatre: 'INOX Megaplex' },
    { user: 'Karthik N.', seats: '2 IMAX 3D Seats', movie: '418', city: 'Chennai', theatre: 'SPI Palazzo Nexus' },
    { user: 'Ananya P.', seats: '2 Premium Seats', movie: 'Premane Oorilo', city: 'Hyderabad', theatre: 'AMB Cinemas' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveBookingIdx((prev) => (prev + 1) % liveFeed.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [liveFeed.length]);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [featuredRes, nowRes, upcomingRes, cinemasRes] = await Promise.all([
          movieService.getFeaturedMovies(),
          movieService.getMovies({ cityId: selectedCity?._id, status: 'now_showing', limit: 12 }),
          movieService.getUpcomingMovies({ limit: 4 }),
          cinemaService.getCinemas({ cityId: selectedCity?._id })
        ]);

        setFeaturedMovies(featuredRes.data || []);
        setNowShowing(nowRes.data || []);
        setUpcoming(upcomingRes.data || []);
        setCinemas(cinemasRes.data || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [selectedCity]);

  const heroMovie = featuredMovies[0] || nowShowing[0];
  const activeFeed = liveFeed[liveBookingIdx];

  return (
    <div>
      {/* Hero Showcase Banner */}
      {heroMovie && (
        <section className="container">
          <div className="hero-banner">
            <img
              src={heroMovie.backdropUrl || heroMovie.posterUrl}
              alt={heroMovie.title}
              className="hero-backdrop"
              referrerPolicy="no-referrer"
            />
            <div className="hero-overlay" />

            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={14} />
                <span>Featured Experience</span>
              </div>

              <h1 className="hero-title">{heroMovie.title}</h1>

              <div className="hero-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FFC107', fontWeight: 700 }}>
                  <Star size={16} fill="#FFC107" />
                  <span>{heroMovie.rating?.toFixed(1)} / 10</span>
                </span>
                <span>•</span>
                <span>{heroMovie.certification}</span>
                <span>•</span>
                <span>{heroMovie.durationMinutes} mins</span>
                <span>•</span>
                <span>{heroMovie.genres?.join(', ')}</span>
              </div>

              <p className="hero-desc">{heroMovie.description}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to={`/movies/${heroMovie.slug || heroMovie._id}`} className="btn btn-primary btn-lg">
                  <Ticket size={18} />
                  <span>Book Tickets</span>
                </Link>
                {heroMovie.trailerUrl && (
                  <button
                    onClick={() => setTrailerModalMovie(heroMovie)}
                    className="btn btn-secondary btn-lg"
                  >
                    <Play size={18} fill="#FFFFFF" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Real-Time Live Booking Activity Ticker */}
      <section className="container" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(229, 9, 20, 0.12) 0%, rgba(26, 26, 36, 0.95) 50%, rgba(229, 9, 20, 0.12) 100%)',
            border: '1px solid rgba(229, 9, 20, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(229, 9, 20, 0.25)', padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(229, 9, 20, 0.45)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2EAD72', display: 'inline-block', boxShadow: '0 0 8px #2EAD72' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                LIVE BOOKING ACTIVITY
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#E2E2F0' }}>
              <strong style={{ color: '#FFFFFF' }}>{activeFeed.user}</strong> just booked <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{activeFeed.seats}</span> for <strong style={{ color: '#FFFFFF' }}>{activeFeed.movie}</strong> at {activeFeed.theatre} ({activeFeed.city})
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2EAD72', fontWeight: 700 }}>
              <Flame size={15} />
              <span>85% Seats Filling Fast</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D0D0DE' }}>
              <TrendingUp size={15} color="var(--accent-primary)" />
              <span>1,420+ Tickets Booked Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Discount Callout */}
      <section className="container" style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #1C1926 0%, #291823 100%)',
            border: '1px solid rgba(229,57,69,0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>Flat 50% OFF on Your Booking</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Use promotional code <strong style={{ color: 'var(--accent-primary)' }}>CINERESERVE50</strong> at checkout.
              </p>
            </div>
          </div>
          <Link to="/offers" className="btn btn-outline btn-sm">
            View Offers
          </Link>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Now Showing in {selectedCity?.name || 'Your City'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Book confirmed seats at top cinemas near you
            </p>
          </div>
          <Link to="/movies" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.92rem' }}>
            <span>See All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <MovieGrid movies={nowShowing} loading={loading} />
      </section>

      {/* Upcoming Releases Section */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Upcoming Blockbusters</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Get ready for the most anticipated cinematic spectacles
            </p>
          </div>
          <Link to="/movies?status=upcoming" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.92rem' }}>
            <span>Explore Upcoming</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <MovieGrid movies={upcoming} loading={loading} />
      </section>

      {/* Cinemas in Selected City */}
      {cinemas.length > 0 && (
        <section className="container" style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Cinemas in {selectedCity?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                State-of-the-art projection, IMAX Laser, and Dolby Atmos audio
              </p>
            </div>
            <Link to="/cinemas" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.92rem' }}>
              <span>View All Cinemas</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {cinemas.map((c) => (
              <div
                key={c._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--accent-primary)" />
                  <span>{c.address.street}, {c.address.area}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {c.facilities?.map((f, i) => (
                    <span key={i} className="facility-chip">{f}</span>
                  ))}
                </div>
                <Link to="/movies" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                  <span>View Shows</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {trailerModalMovie && (
        <Modal
          isOpen={Boolean(trailerModalMovie)}
          onClose={() => setTrailerModalMovie(null)}
          title={`${trailerModalMovie.title} - Official Trailer`}
          maxWidth="720px"
        >
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={trailerModalMovie.trailerUrl.replace('watch?v=', 'embed/')}
              title={trailerModalMovie.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
