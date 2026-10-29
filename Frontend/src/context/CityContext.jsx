import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CityContext = createContext(null);

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/cities');
        const cityList = res.data || [];
        setCities(cityList);

        // Check localStorage for saved city
        const savedCityId = localStorage.getItem('cinereserve_selected_city');
        if (savedCityId) {
          const matched = cityList.find((c) => c._id === savedCityId || c.slug === savedCityId);
          if (matched) {
            setSelectedCity(matched);
            setLoading(false);
            return;
          }
        }

        // Default to popular city (e.g. Hyderabad) or first city
        const defaultCity = cityList.find((c) => c.slug === 'hyderabad') || cityList[0] || null;
        if (defaultCity) {
          setSelectedCity(defaultCity);
          localStorage.setItem('cinereserve_selected_city', defaultCity._id);
        }
      } catch (err) {
        console.error('Failed to load cities', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const selectCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('cinereserve_selected_city', city._id);
    setIsCityModalOpen(false);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        cities,
        selectedCity,
        selectCity,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
        loading
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
