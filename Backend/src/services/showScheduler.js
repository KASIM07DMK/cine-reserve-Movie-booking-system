import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import { City } from '../models/City.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';

export class ShowScheduler {
  /**
   * Ensures that the upcoming 10 days from today have scheduled shows and seat inventory.
   * Cleans up expired shows in the past to maintain fast query performance.
   */
  static async ensureUpcomingSchedule() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    const upcomingShowCount = await Show.countDocuments({
      startTime: { $gte: now, $lte: sevenDaysLater },
      status: 'scheduled'
    });

    console.log(`[Show Scheduler] Currently ${upcomingShowCount} scheduled shows in the next 7 days.`);

    // If we already have 1,000+ upcoming shows, schedule is healthy
    if (upcomingShowCount >= 1000) {
      console.log('[Show Scheduler] Show schedule is fully populated and healthy.');
      return;
    }

    console.log('[Show Scheduler] Seeding multi-day show schedule starting from today...');

    const anantapurCity = await City.findOne({ name: /Anantapur/i }).lean();
    const allCinemas = await Cinema.find({ isActive: true }).lean();
    const allScreens = await Screen.find({ isActive: true }).lean();
    const allMovies = await Movie.find({ isActive: true }).lean();

    const screensByCinema = new Map();
    for (const s of allScreens) {
      const cid = s.cinema.toString();
      if (!screensByCinema.has(cid)) screensByCinema.set(cid, []);
      screensByCinema.get(cid).push(s);
    }

    const anantapurScreens = [];
    if (anantapurCity) {
      const aCinemas = allCinemas.filter((c) => c.city?.toString() === anantapurCity._id.toString());
      for (const ac of aCinemas) {
        const scs = screensByCinema.get(ac._id.toString()) || [];
        for (const sc of scs) {
          anantapurScreens.push({ cinema: ac, screen: sc });
        }
      }
    }

    const languagesList = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];
    const priorityMovies = allMovies.filter((m) =>
      ['ranabali', 'pushpa-2-the-rule', 'kalki-2898-ad', 'devara-part-1', 'jailer-2', 'premane-oorilo', '418', 'stree-2-sarkate-ka-aatank', 'fighter'].includes(m.slug)
    );

    const standardSlots = [
      { h: 9, m: 0 },
      { h: 10, m: 15 },
      { h: 11, m: 30 },
      { h: 12, m: 45 },
      { h: 14, m: 0 },
      { h: 15, m: 15 },
      { h: 16, m: 30 },
      { h: 17, m: 45 },
      { h: 19, m: 0 },
      { h: 20, m: 15 },
      { h: 21, m: 30 },
      { h: 22, m: 45 }
    ];

    const pricingConfigs = {
      '2D': { Regular: 180, Premium: 300, Recliner: 450 },
      '3D': { Regular: 220, Premium: 350, Recliner: 500 },
      'IMAX': { Regular: 350, Premium: 550, Recliner: 800 },
      '4DX': { Regular: 400, Premium: 600, Recliner: 850 }
    };

    let showDocs = [];
    let seatDocs = [];

    const flush = async () => {
      if (showDocs.length > 0) {
        await Show.insertMany(showDocs);
        showDocs = [];
      }
      if (seatDocs.length > 0) {
        await ShowSeat.insertMany(seatDocs);
        seatDocs = [];
      }
    };

    function createShowDoc({ movie, cinema, screen, startTime, language, format = '2D' }) {
      const durationMs = (movie.durationMinutes || 150) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);
      const pricing = pricingConfigs[format] || pricingConfigs['2D'];

      const showId = new mongoose.Types.ObjectId();
      const show = {
        _id: showId,
        movie: movie._id,
        cinema: cinema._id,
        screen: screen._id,
        startTime,
        endTime,
        language,
        format,
        status: 'scheduled',
        pricingConfiguration: pricing,
        totalSeats: 80,
        availableSeatsCount: 80
      };

      const rows = screen.seatingLayout?.rows || [];
      let availableCount = 0;
      const seats = [];

      for (const row of rows) {
        const category = row.category || 'Regular';
        const price = pricing[category] || row.basePrice || 200;

        for (const seat of row.seats || []) {
          if (!seat.isAisle) {
            const isBooked = Math.random() < 0.08;
            const status = isBooked ? 'booked' : 'available';
            if (status === 'available') availableCount++;

            seats.push({
              show: showId,
              seatCode: `${row.rowLabel}${seat.seatNumber}`,
              rowLabel: row.rowLabel,
              seatNumber: seat.seatNumber,
              category,
              price,
              status
            });
          }
        }
      }

      show.availableSeatsCount = availableCount;
      return { show, seats };
    }

    // Schedule 10 days starting from today
    for (let dayOffset = 0; dayOffset <= 9; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);

      // Check if this date already has sufficient shows
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingOnDay = await Show.countDocuments({
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: 'scheduled'
      });

      if (existingOnDay >= 200) {
        continue; // Already has shows
      }

      // Filter slots for today if some hours have passed
      let validSlots = standardSlots;
      if (dayOffset === 0) {
        const curHour = now.getHours();
        validSlots = standardSlots.filter((s) => s.h > curHour || (s.h === curHour && s.m > now.getMinutes() + 10));
        if (validSlots.length === 0) {
          validSlots = [{ h: 23, m: 15 }, { h: 23, m: 45 }];
        }
      }

      // A. Anantapur Shows for priority movies
      if (anantapurScreens.length > 0) {
        for (const movie of priorityMovies) {
          const langs = movie.languages && movie.languages.length > 0 ? movie.languages : languagesList;
          for (const lang of langs) {
            if (!languagesList.includes(lang) && lang !== 'English') continue;

            const countForLang = Math.min(5, validSlots.length);
            for (let sIdx = 0; sIdx < countForLang; sIdx++) {
              const pair = anantapurScreens[(sIdx + dayOffset) % anantapurScreens.length];
              const slot = validSlots[(sIdx * 2 + dayOffset) % validSlots.length];

              const startTime = new Date(targetDate);
              startTime.setHours(slot.h, slot.m, 0, 0);
              const format = sIdx === 0 ? 'IMAX' : (sIdx === 1 ? '3D' : '2D');

              const { show, seats } = createShowDoc({
                movie,
                cinema: pair.cinema,
                screen: pair.screen,
                startTime,
                language: lang,
                format
              });

              showDocs.push(show);
              seatDocs.push(...seats);

              if (seatDocs.length >= 5000) {
                await flush();
              }
            }
          }
        }
      }

      // B. Other cities & screens
      const nonAnantapur = allCinemas.filter((c) => anantapurCity && c.city?.toString() !== anantapurCity._id.toString());
      for (const cinema of nonAnantapur) {
        const scs = screensByCinema.get(cinema._id.toString()) || [];
        for (let sIdx = 0; sIdx < scs.length; sIdx++) {
          const screen = scs[sIdx];
          const numShows = Math.min(5, validSlots.length);

          for (let slotIdx = 0; slotIdx < numShows; slotIdx++) {
            const slot = validSlots[(slotIdx * 2) % validSlots.length];
            const startTime = new Date(targetDate);
            startTime.setHours(slot.h, slot.m, 0, 0);

            const movie = allMovies[(slotIdx + sIdx + dayOffset) % allMovies.length];
            const langs = movie.languages || ['Telugu'];
            const language = langs[slotIdx % langs.length];
            const format = sIdx === 0 ? 'IMAX' : (slotIdx % 2 === 0 ? '3D' : '2D');

            const { show, seats } = createShowDoc({
              movie,
              cinema,
              screen,
              startTime,
              language,
              format
            });

            showDocs.push(show);
            seatDocs.push(...seats);

            if (seatDocs.length >= 5000) {
              await flush();
            }
          }
        }
      }
    }

    await flush();

    const totalNow = await Show.countDocuments({ startTime: { $gte: now }, status: 'scheduled' });
    console.log(`[Show Scheduler] Finished seeding. Total future scheduled shows: ${totalNow}`);
  }
}

