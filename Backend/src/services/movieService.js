import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Cinema } from '../models/Cinema.js';
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
      const cinemaIds = cinemasInCity.map((c) => c._id);
      const activeShows = await Show.find({
        cinema: { $in: cinemaIds },
        startTime: { $gte: new Date() },
        status: 'scheduled'
      }).distinct('movie');

      if (status === 'now_showing') {
        filter._id = { $in: activeShows };
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
  /**
   * Get all shows for a movie filtered by city, date, and language, grouped by cinema.
   * Also computes District-style date-wise show counts for the upcoming week.
   */
  static async getMovieShows({ movieId, cityId, date = null, language = null }) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found.');
    }

    // Determine date range for filtering
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Ensure we don't return shows from the past for today's date
    const now = new Date();
    const queryStart = startOfDay < now ? now : startOfDay;

    // Find cinemas in selected city
    const cinemaQuery = { isActive: true };
    if (cityId) {
      cinemaQuery.city = cityId;
    }
    const cinemas = await Cinema.find(cinemaQuery).populate('city');
    const cinemaMap = new Map(cinemas.map((c) => [c._id.toString(), c]));
    const cinemaIds = Array.from(cinemaMap.keys());

    // Build query for scheduled shows on target date
    const showQuery = {
      movie: movieId,
      cinema: { $in: cinemaIds },
      startTime: { $gte: queryStart, $lte: endOfDay },
      status: 'scheduled'
    };

    // Filter by specific language if provided
    if (language && language !== 'All') {
      showQuery.language = language;
    }

    // Query scheduled shows
    const shows = await Show.find(showQuery)
      .populate('screen')
      .sort({ startTime: 1 });

    // Group shows by cinema
    const cinemasWithShows = [];
    const grouped = new Map();

    for (const show of shows) {
      const cinemaId = show.cinema.toString();
      if (!grouped.has(cinemaId)) {
        const cinema = cinemaMap.get(cinemaId);
        grouped.set(cinemaId, {
          cinema: {
            id: cinema._id,
            name: cinema.name,
            address: cinema.address,
            facilities: cinema.facilities,
            city: cinema.city?.name
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

    // Calculate District-style date-wise show counts for the next 7 days
    const dateShowCounts = {};
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      const d = new Date(now);
      d.setDate(now.getDate() + dayOffset);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));
      const rangeStart = dayStart < now ? now : dayStart;

      const countFilter = {
        movie: movieId,
        cinema: { $in: cinemaIds },
        startTime: { $gte: rangeStart, $lte: dayEnd },
        status: 'scheduled'
      };
      if (language && language !== 'All') {
        countFilter.language = language;
      }

      const count = await Show.countDocuments(countFilter);
      // Format as YYYY-MM-DD
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateShowCounts[dateKey] = count;
    }

    return {
      movie,
      date: startOfDay.toISOString().split('T')[0],
      selectedLanguage: language || 'All',
      dateShowCounts,
      cinemas: cinemasWithShows
    };
  }
}
