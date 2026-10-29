import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { TicketValidation } from '../models/TicketValidation.js';
import { City } from '../models/City.js';
import { ApiResponse } from '../../../server/src/utils/ApiResponse.js';
import { asyncHandler } from '../../../server/src/utils/asyncHandler.js';
import { ApiError } from '../../../server/src/utils/ApiError.js';

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalMovies,
    totalCinemas,
    totalShows,
    totalBookings,
    confirmedBookings,
    revenueData
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Movie.countDocuments({ isActive: true }),
    Cinema.countDocuments({ isActive: true }),
    Show.countDocuments({ startTime: { $gte: new Date() }, status: 'scheduled' }),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'confirmed' }),
    Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])
  ]);

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('user', 'name email');

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        metrics: {
          totalUsers,
          totalMovies,
          totalCinemas,
          totalShows,
          totalBookings,
          confirmedBookings,
          totalRevenue
        },
        recentBookings
      },
      'Dashboard metrics retrieved successfully.'
    )
  );
});

// Movie Management
export const createMovie = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const slug = title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const movie = await Movie.create({ ...req.body, slug });
  return res.status(201).json(new ApiResponse(201, movie, 'Movie created successfully.'));
});

export const updateMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const movie = await Movie.findByIdAndUpdate(movieId, req.body, { new: true });
  if (!movie) throw new ApiError(404, 'Movie not found.');
  return res.status(200).json(new ApiResponse(200, movie, 'Movie updated successfully.'));
});

export const deleteMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const movie = await Movie.findByIdAndUpdate(movieId, { isActive: false }, { new: true });
  if (!movie) throw new ApiError(404, 'Movie not found.');
  return res.status(200).json(new ApiResponse(200, null, 'Movie deactivated successfully.'));
});

// City Management
export const createCity = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const city = await City.create({ ...req.body, slug });
  return res.status(201).json(new ApiResponse(201, city, 'City created successfully.'));
});

// Cinema Management
export const createCinema = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const cinema = await Cinema.create({ ...req.body, slug });
  return res.status(201).json(new ApiResponse(201, cinema, 'Cinema created successfully.'));
});

// Screen Management
export const createScreen = asyncHandler(async (req, res) => {
  const screen = await Screen.create(req.body);
  return res.status(201).json(new ApiResponse(201, screen, 'Screen created successfully.'));
});

// Show Management with Seat Inventory Generation
export const createShow = asyncHandler(async (req, res) => {
  const { movie, cinema, screen: screenId, startTime, endTime, language, format, pricingConfiguration } = req.body;

  // Collision check for the same screen
  const existingCollision = await Show.findOne({
    screen: screenId,
    status: 'scheduled',
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
    ]
  });

  if (existingCollision) {
    throw new ApiError(409, 'Another show is already scheduled on this screen during the requested time window.');
  }

  const screen = await Screen.findById(screenId);
  if (!screen) throw new ApiError(404, 'Screen not found.');

  // Create the Show document
  const show = await Show.create({
    movie,
    cinema,
    screen: screenId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    language,
    format: format || '2D',
    pricingConfiguration: pricingConfiguration || {
      Regular: 200,
      Premium: 350,
      Recliner: 500
    }
  });

  // Generate show-specific seat inventory records based on the screen's seating layout
  const seatDocs = [];
  const rows = screen.seatingLayout?.rows || [];

  for (const row of rows) {
    const category = row.category || 'Regular';
    const price = pricingConfiguration?.[category] || row.basePrice || 200;

    for (const seat of row.seats || []) {
      if (!seat.isAisle) {
        seatDocs.push({
          show: show._id,
          seatCode: `${row.rowLabel}${seat.seatNumber}`,
          rowLabel: row.rowLabel,
          seatNumber: seat.seatNumber,
          category,
          price,
          status: seat.isBlocked ? 'blocked' : 'available'
        });
      }
    }
  }

  if (seatDocs.length > 0) {
    await ShowSeat.insertMany(seatDocs);
    const availableCount = seatDocs.filter((s) => s.status === 'available').length;
    show.totalSeats = seatDocs.length;
    show.availableSeatsCount = availableCount;
    await show.save();
  }

  return res.status(201).json(new ApiResponse(201, show, 'Show and seat inventory generated successfully.'));
});

// Coupon Management
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully.'));
});

// Admin Booking Management
export const getAllBookings = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.bookingStatus = status;
  if (search) {
    filter.$or = [
      { bookingReference: { $regex: search, $options: 'i' } },
      { 'guestDetails.email': { $regex: search, $options: 'i' } },
      { 'guestDetails.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, bookings, 'Bookings retrieved.', {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    })
  );
});

// Ticket Validations Log
export const getValidationLogs = asyncHandler(async (req, res) => {
  const logs = await TicketValidation.find()
    .sort({ validatedAt: -1 })
    .limit(50)
    .populate('booking', 'bookingReference movieSnapshot selectedSeats')
    .populate('validatedBy', 'name email');

  return res.status(200).json(new ApiResponse(200, logs, 'Ticket validation logs retrieved.'));
});
