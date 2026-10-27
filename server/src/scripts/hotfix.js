/**
 * Hot-fix script: Updates movie posters to real working URLs
 * and re-generates shows with FUTURE start times so seat hold + booking works.
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';

const POSTER_MAP = {
  'jailer-2': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uYJW7UN3sSlBMfk9O9TpnGH4ND6.jpg'
  },
  'ranabali': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4d/Akhanda_poster.jpg/220px-Akhanda_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uYJW7UN3sSlBMfk9O9TpnGH4ND6.jpg'
  },
  '418': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Hit_2_poster.jpg/220px-Hit_2_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/cjEcqdRhQz4MZEZ2vy0EEpjO6tH.jpg'
  },
  'premane-oorilo': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Hi_Nanna_poster.jpg/220px-Hi_Nanna_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/pVGzV15BxZrFOTPPTALvCfasFVt.jpg'
  },
  'pushpa-2-the-rule': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uYJW7UN3sSlBMfk9O9TpnGH4ND6.jpg'
  },
  'kalki-2898-ad': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Kalki_2898_AD.jpg/220px-Kalki_2898_AD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/wNAhWBKPddGaRBRNIS2MSnMsOHq.jpg'
  },
  'dune-part-two': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg'
  },
  'deadpool-wolverine': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg'
  },
  'stree-2-sarkate-ka-aatank': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Stree_2_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/p5kpFS0P3lIwzwzHBOULQovNWyj.jpg'
  },
  'gladiator-ii': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Gladiator_II_%282024_film%29_poster.jpg/220px-Gladiator_II_%282024_film%29_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg'
  },
  'devara-part-1': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Devara_Part_1.jpg/220px-Devara_Part_1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/cjEcqdRhQz4MZEZ2vy0EEpjO6tH.jpg'
  },
  'interstellar-10th-anniversary-imax': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  'oppenheimer': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg'
  },
  'fighter': {
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Fighter_%282024_Hindi_film%29.jpg/220px-Fighter_%282024_Hindi_film%29.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/cjEcqdRhQz4MZEZ2vy0EEpjO6tH.jpg'
  }
};

const run = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('[HotFix] Connected to MongoDB.');

  // ===== STEP 1: Update poster URLs for all movies =====
  console.log('\n[HotFix] Step 1: Updating movie poster URLs...');
  const movies = await Movie.find({});
  let updatedCount = 0;

  for (const movie of movies) {
    const mapping = POSTER_MAP[movie.slug];
    if (mapping) {
      movie.posterUrl = mapping.posterUrl;
      movie.backdropUrl = mapping.backdropUrl;
      await movie.save();
      updatedCount++;
      console.log(`  ✅ ${movie.title} -> poster updated`);
    } else {
      console.log(`  ⚠️  No mapping for slug: ${movie.slug}`);
    }
  }
  console.log(`[HotFix] Updated posters for ${updatedCount} / ${movies.length} movies.`);

  // ===== STEP 2: Clear old shows/seats/bookings and re-seed future shows =====
  console.log('\n[HotFix] Step 2: Clearing old shows and re-seeding with future showtimes...');
  await Show.deleteMany({});
  await ShowSeat.deleteMany({});
  await Booking.deleteMany({});
  await Payment.deleteMany({});

  const cinemas = await Cinema.find({ isActive: true });
  const allScreens = await Screen.find({});
  const activeMovies = await Movie.find({ status: 'now_showing', isActive: true });

  console.log(`  Found ${cinemas.length} cinemas, ${allScreens.length} screens, ${activeMovies.length} active movies`);

  const now = new Date();

  // Time slots deliberately in the FUTURE from now
  // We set them relative to current time to guarantee they haven't started yet
  const futureSlots = [
    { offsetHours: 1 },   // 1 hour from now
    { offsetHours: 3 },   // 3 hours from now
    { offsetHours: 6 },   // 6 hours from now
    { offsetHours: 9 }    // 9 hours from now
  ];

  let showCount = 0;
  let seatCount = 0;

  for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
    for (const cinema of cinemas) {
      const cinemaScreens = allScreens.filter(
        (s) => s.cinema.toString() === cinema._id.toString()
      );
      if (cinemaScreens.length === 0) continue;

      // Assign movies across screens
      for (let sIdx = 0; sIdx < cinemaScreens.length; sIdx++) {
        const screen = cinemaScreens[sIdx];
        const movie = activeMovies[(sIdx + dayOffset) % activeMovies.length];
        const slot = futureSlots[(sIdx + dayOffset) % futureSlots.length];

        let startTime;
        if (dayOffset === 0) {
          startTime = new Date(now.getTime() + slot.offsetHours * 60 * 60 * 1000);
        } else {
          const baseHours = [11, 14, 18, 21];
          const hour = baseHours[(sIdx + dayOffset) % baseHours.length];
          startTime = new Date(now);
          startTime.setDate(now.getDate() + dayOffset);
          startTime.setHours(hour, 30, 0, 0);
        }

        const endTime = new Date(startTime.getTime() + (movie.durationMinutes + 15) * 60 * 1000);
        const isImaxScreen = screen.name?.includes('IMAX') || false;
        const format = isImaxScreen ? 'IMAX' : sIdx % 2 === 0 ? '2D' : '3D';

        const pricingConfiguration = {
          Regular: isImaxScreen ? 220 : 180,
          Premium: isImaxScreen ? 380 : 300,
          Recliner: isImaxScreen ? 550 : 450
        };

        const show = await Show.create({
          movie: movie._id,
          cinema: cinema._id,
          screen: screen._id,
          startTime,
          endTime,
          language: movie.languages[0] || 'Telugu',
          format,
          status: 'scheduled',
          pricingConfiguration
        });

        showCount++;

        const seatDocs = [];
        if (screen.seatingLayout && screen.seatingLayout.rows) {
          for (const row of screen.seatingLayout.rows) {
            const category = row.category;
            const price = pricingConfiguration[category] || 180;

            for (const seat of row.seats) {
              const isRandomlyBooked = Math.random() < 0.1;
              seatDocs.push({
                show: show._id,
                seatCode: `${row.rowLabel}${seat.seatNumber}`,
                rowLabel: row.rowLabel,
                seatNumber: seat.seatNumber,
                category,
                price,
                status: seat.isAisle ? 'blocked' : isRandomlyBooked ? 'booked' : 'available',
                isAisle: seat.isAisle || false
              });
            }
          }
        }

        if (seatDocs.length > 0) {
          await ShowSeat.insertMany(seatDocs, { ordered: false });
          seatCount += seatDocs.length;
        }

        const availableCount = seatDocs.filter((s) => s.status === 'available').length;
        await Show.findByIdAndUpdate(show._id, {
          totalSeats: seatDocs.filter((s) => !s.isAisle).length,
          availableSeatsCount: availableCount
        });
      }
    }
  }

  console.log(`[HotFix] Created ${showCount} shows with ${seatCount} seat records.`);
  console.log('[HotFix] ✅ All fixes applied successfully!');
  process.exit(0);
};

run().catch((err) => {
  console.error('[HotFix] FATAL:', err);
  process.exit(1);
});
