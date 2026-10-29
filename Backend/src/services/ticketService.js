import { Booking } from '../models/Booking.js';
import { TicketValidation } from '../models/TicketValidation.js';
import { verifyTicketToken } from '../utils/generateTicketToken.js';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

export class TicketService {
  /**
   * Validate a digital ticket QR code token presented at cinema entrance
   */
  static async validateTicket({ token, showId = null, validatedByUserId }) {
    if (!token) {
      throw new ApiError(400, 'Ticket validation token is required.');
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new ApiError(400, 'Malformed ticket validation token.');
    }

    const bookingReference = parts[0];
    const booking = await Booking.findOne({ bookingReference }).populate('show');

    if (!booking) {
      throw new ApiError(404, 'No booking found matching this ticket reference.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token cryptographic signature
    const isValidToken = verifyTicketToken(token, booking.show._id.toString());
    if (!isValidToken) {
      await TicketValidation.create({
        booking: booking._id,
        show: booking.show._id,
        validatedBy: validatedByUserId,
        validationTokenHash: tokenHash,
        status: 'invalid',
        message: 'Cryptographic signature mismatch.'
      });
      throw new ApiError(400, 'Invalid ticket: Token verification failed.');
    }

    // Check show match if showId was provided by gate scanner
    if (showId && booking.show._id.toString() !== showId.toString()) {
      await TicketValidation.create({
        booking: booking._id,
        show: booking.show._id,
        validatedBy: validatedByUserId,
        validationTokenHash: tokenHash,
        status: 'invalid',
        message: 'Ticket is for a different showtime.'
      });
      throw new ApiError(400, 'Invalid ticket: This ticket belongs to a different showtime.');
    }

    // Check booking status
    if (booking.bookingStatus === 'cancelled') {
      await TicketValidation.create({
        booking: booking._id,
        show: booking.show._id,
        validatedBy: validatedByUserId,
        validationTokenHash: tokenHash,
        status: 'cancelled',
        message: 'Ticket belongs to a cancelled booking.'
      });
      throw new ApiError(400, 'Entry Denied: This booking has been cancelled and refunded.');
    }

    if (booking.bookingStatus !== 'confirmed') {
      throw new ApiError(400, `Entry Denied: Booking status is "${booking.bookingStatus}".`);
    }

    // Check single-use validation
    if (booking.ticketValidated) {
      await TicketValidation.create({
        booking: booking._id,
        show: booking.show._id,
        validatedBy: validatedByUserId,
        validationTokenHash: tokenHash,
        status: 'already_used',
        message: `Already validated on ${booking.ticketValidatedAt?.toISOString()}`
      });
      return {
        status: 'already_used',
        isValid: false,
        message: `Alert: Ticket already scanned on ${new Date(booking.ticketValidatedAt).toLocaleTimeString()}`,
        booking
      };
    }

    // Mark as validated
    booking.ticketValidated = true;
    booking.ticketValidatedAt = new Date();
    booking.ticketValidatedBy = validatedByUserId;
    await booking.save();

    await TicketValidation.create({
      booking: booking._id,
      show: booking.show._id,
      validatedBy: validatedByUserId,
      validationTokenHash: tokenHash,
      status: 'valid',
      message: 'Ticket successfully verified and admitted.'
    });

    return {
      status: 'valid',
      isValid: true,
      message: 'Ticket verified successfully! Admitted.',
      booking: {
        bookingReference: booking.bookingReference,
        movieTitle: booking.movieSnapshot.title,
        cinemaName: booking.cinemaSnapshot.name,
        screenName: booking.cinemaSnapshot.screenName,
        seats: booking.selectedSeats.map((s) => s.seatCode),
        showTime: booking.showTime.startTime
      }
    };
  }
}
