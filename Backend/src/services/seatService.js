import { ShowSeat } from '../models/ShowSeat.js';
import { Show } from '../models/Show.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import crypto from 'crypto';

export class SeatService {
  /**
   * Release all expired seat holds for a specific show or system-wide
   */
  static async releaseExpiredHolds(showId = null) {
    const filter = {
      status: 'held',
      holdExpiresAt: { $lt: new Date() }
    };
    if (showId) {
      filter.show = showId;
    }

    const expiredSeats = await ShowSeat.find(filter);
    if (expiredSeats.length > 0) {
      const result = await ShowSeat.updateMany(filter, {
        $set: {
          status: 'available',
          holdId: null,
          heldByUser: null,
          guestSessionId: null,
          holdExpiresAt: null
        }
      });

      // Recalculate available seat counts for affected shows
      const affectedShowIds = [...new Set(expiredSeats.map((s) => s.show.toString()))];
      for (const sId of affectedShowIds) {
        const availableCount = await ShowSeat.countDocuments({ show: sId, status: 'available' });
        await Show.findByIdAndUpdate(sId, { availableSeatsCount: availableCount });
      }

      return result.modifiedCount;
    }
    return 0;
  }

  /**
   * Atomically hold seats for a user or guest session
   */
  static async holdSeats({ showId, seatCodes, userId = null, guestSessionId = null }) {
    if (!seatCodes || !seatCodes.length) {
      throw new ApiError(400, 'Please select at least one seat.');
    }

    if (seatCodes.length > 10) {
      throw new ApiError(400, 'Maximum 10 seats allowed per booking.');
    }

    // 1. Release any expired holds for this show first
    await this.releaseExpiredHolds(showId);

    const show = await Show.findById(showId);
    if (!show) {
      throw new ApiError(404, 'Showtime not found.');
    }

    if (new Date(show.startTime) < new Date()) {
      throw new ApiError(400, 'Cannot book seats for a show that has already started.');
    }

    const holdId = `hold_${crypto.randomBytes(8).toString('hex')}`;
    const holdExpiresAt = new Date(Date.now() + config.seatHoldDurationMinutes * 60 * 1000);

    // 2. Atomic attempt: try to lock ALL selected seats that are currently 'available'
    const updateResult = await ShowSeat.updateMany(
      {
        show: showId,
        seatCode: { $in: seatCodes },
        status: 'available'
      },
      {
        $set: {
          status: 'held',
          holdId,
          heldByUser: userId || null,
          guestSessionId: guestSessionId || null,
          holdExpiresAt
        }
      }
    );

    // If we couldn't acquire ALL requested seats, roll back any partially acquired seats
    if (updateResult.modifiedCount !== seatCodes.length) {
      if (updateResult.modifiedCount > 0) {
        await ShowSeat.updateMany(
          { holdId },
          {
            $set: {
              status: 'available',
              holdId: null,
              heldByUser: null,
              guestSessionId: null,
              holdExpiresAt: null
            }
          }
        );
      }
      throw new ApiError(409, 'One or more selected seats were just taken. Please choose other seats.');
    }

    // Update show availability count
    const availableCount = await ShowSeat.countDocuments({ show: showId, status: 'available' });
    await Show.findByIdAndUpdate(showId, { availableSeatsCount: availableCount });

    // Fetch the held seats
    const heldSeats = await ShowSeat.find({ holdId }).sort({ rowLabel: 1, seatNumber: 1 });

    return {
      holdId,
      holdExpiresAt,
      seats: heldSeats,
      totalHoldDurationSeconds: config.seatHoldDurationMinutes * 60
    };
  }

  /**
   * Release a hold explicitly (when user cancels seat selection or navigates away)
   */
  static async releaseHold(holdId, userId = null, guestSessionId = null) {
    const query = { holdId };
    if (userId) {
      query.heldByUser = userId;
    } else if (guestSessionId) {
      query.guestSessionId = guestSessionId;
    }

    const heldSeats = await ShowSeat.find(query);
    if (!heldSeats.length) {
      return { released: false, count: 0 };
    }

    const showId = heldSeats[0].show;

    await ShowSeat.updateMany(
      { holdId },
      {
        $set: {
          status: 'available',
          holdId: null,
          heldByUser: null,
          guestSessionId: null,
          holdExpiresAt: null
        }
      }
    );

    const availableCount = await ShowSeat.countDocuments({ show: showId, status: 'available' });
    await Show.findByIdAndUpdate(showId, { availableSeatsCount: availableCount });

    return { released: true, count: heldSeats.length };
  }

  /**
   * Verify an active hold
   */
  static async verifyHold(holdId, showId) {
    await this.releaseExpiredHolds(showId);

    const heldSeats = await ShowSeat.find({
      holdId,
      show: showId,
      status: 'held',
      holdExpiresAt: { $gt: new Date() }
    });

    if (!heldSeats.length) {
      throw new ApiError(410, 'Your seat hold has expired or is no longer valid. Please select your seats again.');
    }

    return heldSeats;
  }
}
