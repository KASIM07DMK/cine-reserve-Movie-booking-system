import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useCity } from '../context/CityContext';
import { CinemaCard } from '../components/cinemas/CinemaCard';
import { Loader } from '../components/common/Loader';
import { MapPin, Search } from 'lucide-react';

export const Cinemas = () => {
  const { selectedCity, openCityModal } = useCity();
  const [cinemas, setCinemas] = useState([]);
  const [cinemaShows, setCinemaShows] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true);
      try {
        const res = await cinemaService.getCinemas({ cityId: selectedCity?._id, search });
        const cinemaList = res.data || [];
        setCinemas(cinemaList);

        // Fetch today's shows for each cinema
        const showsMap = {};
        for (const c of cinemaList) {
          try {
            const showsRes = await cinemaService.getCinemaShows(c._id);
            showsMap[c._id] = showsRes.data || [];
          } catch {
            showsMap[c._id] = [];
          }
        }
        setCinemaShows(showsMap);
      } catch (err) {
        console.error('Failed to load cinemas', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [selectedCity, search]);

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Cinemas in {selectedCity?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Find the closest theaters, Dolby Atmos multiplexes, and IMAX screens
          </p>
        </div>

        <button onClick={openCityModal} className="btn btn-secondary btn-sm">
          <MapPin size={14} color="var(--accent-primary)" />
          <span>Change City ({selectedCity?.name})</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '2rem', maxWidth: '480px' }}>
        <input
          type="text"
          placeholder="Search cinemas or locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {loading ? (
        <Loader size="large" text="Finding nearby cinemas..." />
      ) : cinemas.length > 0 ? (
        <div>
          {cinemas.map((cinema) => (
            <CinemaCard
              key={cinema._id}
              cinema={cinema}
              shows={cinemaShows[cinema._id] || []}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
          <MapPin size={44} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Cinemas Found in {selectedCity?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Try searching a different location or select another city.
          </p>
        </div>
      )}
    </div>
  );
};
