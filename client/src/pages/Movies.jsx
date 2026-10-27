import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useCity } from '../context/CityContext';
import { MovieGrid } from '../components/movies/MovieGrid';
import { MovieFilters } from '../components/movies/MovieFilters';
import { MovieSearch } from '../components/movies/MovieSearch';
import { useDebounce } from '../hooks/useDebounce';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useCity();

  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sort, setSort] = useState('releaseDate');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const queryParams = {
          cityId: selectedCity?._id,
          page,
          limit: 12,
          sort
        };

        if (debouncedSearch) queryParams.search = debouncedSearch;
        if (genre !== 'All') queryParams.genre = genre;
        if (language !== 'All') queryParams.language = language;
        if (status !== 'All') queryParams.status = status;

        const res = await movieService.getMovies(queryParams);
        setMovies(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load movies', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCity, debouncedSearch, genre, language, status, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setGenre('All');
    setLanguage('All');
    setStatus('All');
    setSort('releaseDate');
    setPage(1);
  };

  return (
    <div className="container page-wrapper" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore Movies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            {selectedCity ? `Showing cinema listings in ${selectedCity.name}` : 'Explore films nationwide'}
          </p>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: '0.5rem 0.85rem' }}
          >
            <option value="releaseDate">Release Date</option>
            <option value="rating">Critic & Audience Rating</option>
            <option value="title">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <MovieSearch value={search} onChange={setSearch} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Filters Sidebar */}
        <aside>
          <MovieFilters
            selectedGenre={genre}
            onSelectGenre={(g) => { setGenre(g); setPage(1); }}
            selectedLanguage={language}
            onSelectLanguage={(l) => { setLanguage(l); setPage(1); }}
            selectedStatus={status}
            onSelectStatus={(s) => { setStatus(s); setPage(1); }}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Movie Results */}
        <main>
          <MovieGrid movies={movies} loading={loading} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
