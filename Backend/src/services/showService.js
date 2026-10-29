import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Screen } from '../models/Screen.js';
import { SeatService } from './seatService.js';
import { ApiError } from '../utils/ApiError.js';

export class ShowService {
  static async getShowDetails(showId) {
    const show = await Show.findById(showId)
      .populate('movie')
      .populate({
        path: 'cinema',
        populate: { path: 'city' }
      })
      .populate('screen');

    if (!show) {
      throw new ApiError(404, 'Showtime not found.');
    }

    return show;
  }

  /**
   * Retrieves interactive seating layout and real-time inventory for a show
   */
  static async getShowSeats(showId, userId = null, guestSessionId = null) {
    // 1. Release any expired holds in real-time
    await SeatService.releaseExpiredHolds(showId);

    const show = await Show.findById(showId)
      .populate('movie', 'title certification posterUrl durationMinutes')
      .populate({
        path: 'cinema',
        select: 'name address facilities city',
        populate: { path: 'city', select: 'name' }
      })
      .populate('screen');

    if (!show) {
      throw new ApiError(404, 'Showtime not found.');
    }

    const seats = await ShowSeat.find({ show: showId }).sort({ rowLabel: 1, seatNumber: 1 });

    // Format seats with personalized hold states
    const formattedSeats = seats.map((seat) => {
      let displayStatus = seat.status;
      const isMyHold =
        seat.status === 'held' &&
        ((userId && seat.heldByUser && seat.heldByUser.toString() === userId.toString()) ||
          (guestSessionId && seat.guestSessionId === guestSessionId));

      if (isMyHold) {
        displayStatus = 'selected'; // User's own currently active hold
      }

      return {
        id: seat._id,
        seatCode: seat.seatCode,
        rowLabel: seat.rowLabel,
        seatNumber: seat.seatNumber,
        category: seat.category,
        price: seat.price,
        status: displayStatus,
        isMyHold,
        holdExpiresAt: isMyHold ? seat.holdExpiresAt : null
      };
    });

    return {
      show: {
        id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        language: show.language,
        format: show.format,
        movie: show.movie,
        cinema: show.cinema,
        screen: {
          id: show.screen?._id,
          name: show.screen?.name,
          seatingLayout: show.screen?.seatingLayout,
          seatCategories: show.screen?.seatCategories
        },
        pricingConfiguration: show.pricingConfiguration
      },
      seats: formattedSeats
    };
  }
}
