import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { City } from '../models/City.js';
import { ApiError } from '../utils/ApiError.js';

export class MovieService {
  /**
   * Get paginated movies with rich filters
   */
  static async getMovies({
    cityId = null,
    search = '',
    genre = '',
    language = '',
    status = '',
    sort = 'releaseDate',
    order = 'desc',
    page = 1,
    limit = 12
  }) {
    const filter = { isActive: true };

    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (genre && genre !== 'All') {
      filter.genres = genre;
    }

    if (language && language !== 'All') {
      filter.languages = language;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    // If city is specified, filter movies that have active shows in this city
    if (cityId) {
      const cinemasInCity = await Cinema.find({ city: cityId, isActive: true }).select('_id');
      if (cinemasInCity.length > 0) {
        const cinemaIds = cinemasInCity.map((c) => c._id);
        const activeShows = await Show.find({
          cinema: { $in: cinemaIds },
          startTime: { $gte: new Date() },
          status: 'scheduled'
        }).distinct('movie');

        if (status === 'now_showing' && activeShows.length > 0) {
          filter._id = { $in: activeShows };
        }
      }
    }

    const sortOptions = {};
    if (sort === 'title') {
      sortOptions.title = order === 'desc' ? -1 : 1;
    } else if (sort === 'rating') {
      sortOptions.rating = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.releaseDate = order === 'desc' ? -1 : 1;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [movies, total] = await Promise.all([
      Movie.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Movie.countDocuments(filter)
    ]);

    return {
      movies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getFeaturedMovies() {
    return Movie.find({ isFeatured: true, isActive: true }).limit(5);
  }

  static async getMovieDetails(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const movie = await Movie.findOne(query);
    if (!movie) {
      throw new ApiError(404, 'Movie not found.');
    }
    return movie;
  }

  /**
   * Get all shows for a movie filtered by city and date, grouped by cinema
   */
  static async getMovieShows({ movieId, cityId, date = null }) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found.');
    }

    // Determine clean date bounds without mutating target date
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();
    const isToday = targetDate.toDateString() === now.toDateString();
    const queryStart = isToday ? now : startOfDay;

    // Find cinemas in selected city
    let cinemaQuery = { isActive: true };
    if (cityId) {
      cinemaQuery.city = cityId;
    }
    let cinemas = await Cinema.find(cinemaQuery).populate('city');

    // If no cinemas exist in this specific city, fallback to all active cinemas
    if (cinemas.length === 0) {
      cinemas = await Cinema.find({ isActive: true }).populate('city');
    }

    const cinemaMap = new Map(cinemas.map((c) => [c._id.toString(), c]));

    // Query scheduled shows for the given date
    let shows = await Show.find({
      movie: movieId,
      cinema: { $in: Array.from(cinemaMap.keys()) },
      startTime: { $gte: queryStart, $lte: endOfDay },
      status: 'scheduled'
    })
      .populate('screen')
      .populate('cinema')
      .sort({ startTime: 1 });

    // If all shows for today have passed, fetch next upcoming shows for this movie so user sees showtimes
    if (shows.length === 0) {
      shows = await Show.find({
        movie: movieId,
        cinema: { $in: Array.from(cinemaMap.keys()) },
        startTime: { $gte: now },
        status: 'scheduled'
      })
        .populate('screen')
        .populate('cinema')
        .sort({ startTime: 1 })
        .limit(16);
    }

    // Group shows by cinema
    const cinemasWithShows = [];
    const grouped = new Map();

    for (const show of shows) {
      const cinemaId = (show.cinema?._id || show.cinema).toString();
      if (!grouped.has(cinemaId)) {
        const cinema = cinemaMap.get(cinemaId) || show.cinema;
        if (!cinema) continue;
        grouped.set(cinemaId, {
          cinema: {
            id: cinema._id,
            name: cinema.name,
            address: cinema.address,
            facilities: cinema.facilities || ['Dolby Atmos', '4K Laser', 'Recliner Seating'],
            city: cinema.city?.name || 'City'
          },
          shows: []
        });
      }

      // Calculate availability state accurately based on actual inventory
      let availabilityState = 'Available';
      if (show.availableSeatsCount === 0) {
        availabilityState = 'Sold Out';
      } else if (show.totalSeats > 0 && show.availableSeatsCount / show.totalSeats <= 0.2) {
        availabilityState = 'Filling Fast';
      }

      grouped.get(cinemaId).shows.push({
        id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        language: show.language,
        format: show.format,
        screenName: show.screen?.name,
        pricing: show.pricingConfiguration,
        availableSeatsCount: show.availableSeatsCount,
        totalSeats: show.totalSeats,
        availabilityState
      });
    }

    for (const item of grouped.values()) {
      cinemasWithShows.push(item);
    }

    return {
      movie,
      date: startOfDay.toISOString().split('T')[0],
      cinemas: cinemasWithShows
    };
  }
}
