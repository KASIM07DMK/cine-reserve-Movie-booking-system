import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Coupon } from '../models/Coupon.js';
import { SeatService } from './seatService.js';
import { CouponService } from './couponService.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import { generateBookingReference } from '../utils/generateBookingReference.js';
import { generateTicketToken } from '../utils/generateTicketToken.js';
import QRCode from 'qrcode';

export class BookingService {
  /**
   * Server-authoritative price breakdown calculation
   */
  static calculatePricing(seats, discount = 0) {
    const baseTicketSubtotal = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Standard booking fee (e.g. 10% of ticket subtotal or flat fee)
    const bookingFee = Math.round((baseTicketSubtotal * config.bookingFeePercentage) / 100);

    // GST/Tax on booking fee (18%)
    const tax = Math.round((bookingFee * config.taxPercentage) / 100);

    const discountedSubtotal = Math.max(0, baseTicketSubtotal - discount);
    const finalAmount = Math.max(0, discountedSubtotal + bookingFee + tax);

    return {
      baseTicketSubtotal,
      bookingFee,
      tax,
      discount,
      finalAmount
    };
  }

  /**
   * Generates a preview breakdown of a booking
   */
  static async previewBooking({ showId, holdId, couponCode = null, userId = null }) {
    const heldSeats = await SeatService.verifyHold(holdId, showId);

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('cinema')
      .populate('screen');

    if (!show) {
      throw new ApiError(404, 'Showtime not found.');
    }

    let couponDiscount = 0;
    let validatedCoupon = null;

    if (couponCode) {
      const ticketSubtotal = heldSeats.reduce((sum, s) => sum + s.price, 0);
      const couponResult = await CouponService.validateCoupon(couponCode, ticketSubtotal, userId);
      couponDiscount = couponResult.coupon.discountAmount;
      validatedCoupon = couponResult.coupon;
    }

    const pricing = this.calculatePricing(heldSeats, couponDiscount);

    return {
      show: {
        id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        language: show.language,
        format: show.format
      },
      movie: {
        id: show.movie._id,
        title: show.movie.title,
        posterUrl: show.movie.posterUrl,
        certification: show.movie.certification,
        durationMinutes: show.movie.durationMinutes
      },
      cinema: {
        id: show.cinema._id,
        name: show.cinema.name,
        address: `${show.cinema.address.street}, ${show.cinema.address.area}`,
        screenName: show.screen.name
      },
      seats: heldSeats.map((s) => ({
        seatCode: s.seatCode,
        rowLabel: s.rowLabel,
        seatNumber: s.seatNumber,
        category: s.category,
        price: s.price
      })),
      pricing,
      coupon: validatedCoupon,
      holdExpiresAt: heldSeats[0].holdExpiresAt
    };
  }

  /**
   * Creates a pending booking record linked to an active hold
   */
  static async createPendingBooking({ showId, holdId, couponCode = null, user = null, guestDetails = null }) {
    const heldSeats = await SeatService.verifyHold(holdId, showId);

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('cinema')
      .populate('screen');

    if (!show) {
      throw new ApiError(404, 'Showtime not found.');
    }

    let couponDiscount = 0;
    let couponRecord = { code: null, discountAmount: 0 };

    if (couponCode) {
      const ticketSubtotal = heldSeats.reduce((sum, s) => sum + s.price, 0);
      const couponResult = await CouponService.validateCoupon(couponCode, ticketSubtotal, user?._id);
      couponDiscount = couponResult.coupon.discountAmount;
      couponRecord = {
        code: couponResult.coupon.code,
        discountAmount: couponDiscount
      };
    }

    const pricing = this.calculatePricing(heldSeats, couponDiscount);
    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      user: user?._id || null,
      guestDetails: guestDetails || null,
      show: show._id,
      movieSnapshot: {
        id: show.movie._id,
        title: show.movie.title,
        posterUrl: show.movie.posterUrl,
        certification: show.movie.certification,
        language: show.language,
        format: show.format,
        durationMinutes: show.movie.durationMinutes
      },
      cinemaSnapshot: {
        id: show.cinema._id,
        name: show.cinema.name,
        address: `${show.cinema.address.street}, ${show.cinema.address.area}`,
        screenName: show.screen.name,
        city: show.cinema.city?.name || 'City'
      },
      showTime: {
        startTime: show.startTime,
        endTime: show.endTime
      },
      selectedSeats: heldSeats.map((s) => ({
        seatCode: s.seatCode,
        rowLabel: s.rowLabel,
        seatNumber: s.seatNumber,
        category: s.category,
        price: s.price
      })),
      pricingBreakdown: pricing,
      coupon: couponRecord,
      totalAmount: pricing.finalAmount,
      currency: 'INR',
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      holdId,
      holdExpiresAt: heldSeats[0].holdExpiresAt
    });

    return booking;
  }

  /**
   * Confirms booking and converts held seats into permanently booked seats
   */
  static async confirmBooking(bookingId, paymentRecord) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.bookingStatus === 'confirmed') {
      return booking; // Idempotent return
    }

    // Atomically transition the seats from held -> booked
    const seatCodes = booking.selectedSeats.map((s) => s.seatCode);
    const updateResult = await ShowSeat.updateMany(
      {
        show: booking.show,
        seatCode: { $in: seatCodes },
        status: 'held',
        holdId: booking.holdId
      },
      {
        $set: {
          status: 'booked',
          booking: booking._id,
          holdId: null,
          heldByUser: null,
          guestSessionId: null,
          holdExpiresAt: null
        }
      }
    );

    // If hold expired during payment or was released, handle reconciliation
    if (updateResult.modifiedCount !== seatCodes.length) {
      // Check if seats were already booked for this booking
      const alreadyBooked = await ShowSeat.countDocuments({
        show: booking.show,
        seatCode: { $in: seatCodes },
        booking: booking._id
      });

      if (alreadyBooked !== seatCodes.length) {
        booking.bookingStatus = 'cancelled';
        booking.paymentStatus = 'refund pending';
        booking.cancellationReason = 'Seat hold expired before payment confirmation. Refund scheduled.';
        await booking.save();
        throw new ApiError(
          409,
          'Your seat hold expired during checkout. Payment will be refunded automatically within 24 hours.'
        );
      }
    }

    // Generate secure validation token
    const qrToken = generateTicketToken(booking.bookingReference, booking.show.toString());

    // Generate QR code base64 image data url
    const qrCodeDataUrl = await QRCode.toDataURL(qrToken, {
      width: 250,
      margin: 2,
      color: {
        dark: '#101014',
        light: '#FFFFFF'
      }
    });

    // Update booking to confirmed
    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.qrValidationToken = qrToken;
    await booking.save();

    // Increment coupon count if used
    if (booking.coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: booking.coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    // Recalculate show available seats
    const availableCount = await ShowSeat.countDocuments({ show: booking.show, status: 'available' });
    await Show.findByIdAndUpdate(booking.show, { availableSeatsCount: availableCount });

    const bookingObj = booking.toObject();
    bookingObj.qrCodeDataUrl = qrCodeDataUrl;
    return bookingObj;
  }

  /**
   * Cancel an eligible confirmed booking
   */
  static async cancelBooking(bookingId, userId, reason = 'User requested cancellation') {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    // Ownership check (unless admin)
    if (booking.user && booking.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to cancel this booking.');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new ApiError(400, 'Booking is already cancelled.');
    }

    // Cancellation policy: allow cancellation up to 2 hours before show start
    const showTime = new Date(booking.showTime.startTime);
    const cutOffTime = new Date(showTime.getTime() - 2 * 60 * 60 * 1000);
    const now = new Date();

    if (now > cutOffTime) {
      throw new ApiError(
        400,
        'Bookings cannot be cancelled less than 2 hours before the scheduled showtime.'
      );
    }

    // Release seats
    const seatCodes = booking.selectedSeats.map((s) => s.seatCode);
    await ShowSeat.updateMany(
      {
        show: booking.show,
        seatCode: { $in: seatCodes },
        booking: booking._id
      },
      {
        $set: {
          status: 'available',
          booking: null,
          holdId: null,
          heldByUser: null,
          guestSessionId: null,
          holdExpiresAt: null
        }
      }
    );

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();

    // Recalculate available seat count
    const availableCount = await ShowSeat.countDocuments({ show: booking.show, status: 'available' });
    await Show.findByIdAndUpdate(booking.show, { availableSeatsCount: availableCount });

    return booking;
  }

  /**
   * Fetch user's booking history
   */
  static async getUserBookings(userId) {
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Attach QR codes to confirmed bookings
    for (const b of bookings) {
      if (b.bookingStatus === 'confirmed' && b.qrValidationToken) {
        b.qrCodeDataUrl = await QRCode.toDataURL(b.qrValidationToken, {
          width: 200,
          margin: 1,
          color: { dark: '#101014', light: '#FFFFFF' }
        });
      }
    }

    return bookings;
  }

  /**
   * Fetch single booking details with QR code
   */
  static async getBookingDetails(bookingId, userId = null, isAdmin = false) {
    const booking = await Booking.findById(bookingId).populate('show').lean();
    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (!isAdmin && booking.user && booking.user.toString() !== userId?.toString()) {
      throw new ApiError(403, 'Unauthorized access to booking details.');
    }

    if (booking.bookingStatus === 'confirmed' && booking.qrValidationToken) {
      booking.qrCodeDataUrl = await QRCode.toDataURL(booking.qrValidationToken, {
        width: 250,
        margin: 2,
        color: { dark: '#101014', light: '#FFFFFF' }
      });
    }

    return booking;
  }
}
