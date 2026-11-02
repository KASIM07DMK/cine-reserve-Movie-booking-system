import api from './api';

export const movieService = {
  async getMovies(params = {}) {
    return api.get('/movies', { params });
  },

  async getFeaturedMovies() {
    return api.get('/movies/featured');
  },

  async getUpcomingMovies(params = {}) {
    return api.get('/movies/upcoming', { params });
  },

  async getMovieDetails(idOrSlug) {
    return api.get(`/movies/${idOrSlug}`);
  },

  async getMovieShows(movieId, { cityId, date, language } = {}) {
    return api.get(`/movies/${movieId}/shows`, { params: { cityId, date, language } });
  }
};
