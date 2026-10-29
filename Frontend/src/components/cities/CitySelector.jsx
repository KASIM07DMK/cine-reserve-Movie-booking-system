import React, { useState } from 'react';
import { useCity } from '../../context/CityContext';
import { Modal } from '../common/Modal';
import { Search, MapPin, Check } from 'lucide-react';

export const CitySelector = () => {
  const { cities, selectedCity, selectCity, isCityModalOpen, closeCityModal } = useCity();
  const [searchTerm, setSearchTerm] = useState('');

  const popularCities = cities.filter((c) => c.isPopular);
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <Modal isOpen={isCityModalOpen} onClose={closeCityModal} title="Select Your City" maxWidth="620px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search for your city (e.g. Hyderabad, Bengaluru, Mumbai)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.8rem' }}
            autoFocus
          />
        </div>

        {/* Popular Cities */}
        {!searchTerm && popularCities.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.85rem' }}>
              Popular Cities
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {popularCities.map((city) => {
                const isSelected = selectedCity?._id === city._id;
                return (
                  <button
                    key={city._id}
                    onClick={() => selectCity(city)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <MapPin size={20} style={{ marginBottom: '0.35rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span>{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All / Filtered Cities */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.85rem' }}>
            {searchTerm ? 'Search Results' : 'Other Supported Cities'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredCities.map((city) => {
              const isSelected = selectedCity?._id === city._id;
              return (
                <button
                  key={city._id}
                  onClick={() => selectCity(city)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>{city.name}</span>
                  {isSelected && <Check size={16} color="var(--accent-primary)" />}
                </button>
              );
            })}
            {filteredCities.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1', padding: '1rem 0' }}>
                No cities found matching "{searchTerm}".
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
