import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');
console.log('Connected to MongoDB cinereserve');

// Models
const Movie = mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));
const City = mongoose.model('City', new mongoose.Schema({}, { strict: false }));
const Cinema = mongoose.model('Cinema', new mongoose.Schema({}, { strict: false }));
const Screen = mongoose.model('Screen', new mongoose.Schema({}, { strict: false }));
const Show = mongoose.model('Show', new mongoose.Schema({}, { strict: false }));
const ShowSeat = mongoose.model('ShowSeat', new mongoose.Schema({}, { strict: false }));

// 1. Update Movie Trailer URLs and Languages
console.log('\n--- Step 1: Updating Movie Trailers and Languages ---');

const verifiedTrailers = {
  'ranabali': {
    trailerUrl: 'https://www.youtube.com/watch?v=fNDRSver0uM', // Daaku Maharaaj (NBK, Bobby Deol)
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']
  },
  'jailer-2': {
    trailerUrl: 'https://www.youtube.com/watch?v=-mYAvoEvX7I', // Jailer 2 Official Trailer
    languages: ['Telugu', 'Tamil', 'Hindi', 'Kannada', 'Malayalam']
  },
  'premane-oorilo': {
    trailerUrl: 'https://www.youtube.com/watch?v=xB7b3RzicUU', // Family Star (Vijay Deverakonda)
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']
  },
  'pushpa-2-the-rule': {
    trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgOHgdw', // Pushpa 2 The Rule
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']
  },
  '418': {
    trailerUrl: 'https://www.youtube.com/watch?v=4GzAwnjVTqc', // HIT 2 (Adivi Sesh)
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']
  },
  'kalki-2898-ad': {
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk', // Kalki 2898 AD
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'English']
  },
  'deadpool-and-wolverine': {
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    languages: ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada']
  },
  'dune-part-two': {
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    languages: ['English', 'Hindi', 'Telugu', 'Tamil']
  },
  'gladiator-ii': {
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    languages: ['English', 'Hindi', 'Telugu', 'Tamil']
  },
  'stree-2-sarkate-ka-aatank': {
    trailerUrl: 'https://www.youtube.com/watch?v=VlvOgk5BHS4', // Stree 2 Official Trailer
    languages: ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam']
  },
  'oppenheimer': {
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    languages: ['English', 'Hindi', 'Telugu']
  },
  'fighter': {
    trailerUrl: 'https://www.youtube.com/watch?v=6amIq_mP4xM', // Fighter Official Trailer
    languages: ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam']
  },
  'avatar-fire-and-ash': {
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    languages: ['English', 'Telugu', 'Hindi', 'Tamil', 'Malayalam']
  },
  'interstellar-10th-anniversary': {
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    languages: ['English', 'Hindi', 'Telugu']
  },
  'devara-part-1': {
    trailerUrl: 'https://www.youtube.com/watch?v=yEffTqkDBdY', // Devara Release Trailer
    languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']
  }
};

for (const [slug, data] of Object.entries(verifiedTrailers)) {
  const res = await Movie.updateOne(
    { slug },
    { $set: { trailerUrl: data.trailerUrl, languages: data.languages, isActive: true } }
  );
  console.log(`Updated movie [${slug}]: trailerUrl & languages: ${data.languages.join(', ')}`);
}

// 2. Setup Cinemas and Screens for Anantapur
console.log('\n--- Step 2: Ensuring Anantapur Cinemas and Screens ---');
const anantapurCity = await City.findOne({ name: /Anantapur/i }).lean();
if (!anantapurCity) {
  throw new Error('Anantapur city not found in DB!');
}

const standardLayout = () => {
  const rows = [];
  const categories = [
    { label: 'A', cat: 'Recliner', price: 450 },
    { label: 'B', cat: 'Recliner', price: 450 },
    { label: 'C', cat: 'Premium', price: 300 },
    { label: 'D', cat: 'Premium', price: 300 },
    { label: 'E', cat: 'Regular', price: 180 },
    { label: 'F', cat: 'Regular', price: 180 },
    { label: 'G', cat: 'Regular', price: 180 },
    { label: 'H', cat: 'Regular', price: 180 }
  ];
  for (const c of categories) {
    const seats = [];
    for (let s = 1; s <= 12; s++) {
      seats.push({
        seatNumber: s,
        isAisle: s === 4 || s === 9,
        isBlocked: false
      });
    }
    rows.push({
      rowLabel: c.label,
      category: c.cat,
      basePrice: c.price,
      seats
    });
  }
  return {
    totalRows: 8,
    totalColumns: 12,
    rows
  };
};

const seatCategories = [
  { name: 'Regular', color: '#3B82F6', defaultPrice: 180 },
  { name: 'Premium', color: '#10B981', defaultPrice: 300 },
  { name: 'Recliner', color: '#F59E0B', defaultPrice: 450 }
];

// Ensure Anantapur Cinemas
const anantapurCinemasData = [
  {
    name: 'CineReserve Grand Theatre: Anantapur',
    slug: 'cinereserve-grand-theatre-anantapur',
    address: { street: 'Main Road', area: 'Subhash Nagar', pincode: '515001' },
    facilities: ['Dolby Atmos', '4K Projection', 'Recliner Seating', 'Food Court', 'Parking'],
    supportedFormats: ['2D', '3D', 'IMAX'],
    screenNames: [
      'Audi 1 - Dolby Atmos 4K',
      'Audi 2 - IMAX with Laser',
      'Audi 3 - 4DX Ultra Motion',
      'Audi 4 - Gold Class VIP'
    ]
  },
  {
    name: 'V-Max Cineplex: Clock Tower, Anantapur',
    slug: 'v-max-cineplex-clock-tower-anantapur',
    address: { street: 'Clock Tower Road', area: 'Old Town', pincode: '515001' },
    facilities: ['Dolby 7.1', 'RGB Laser', 'Push-Back Seats', 'Cafeteria', 'Valet Parking'],
    supportedFormats: ['2D', '3D'],
    screenNames: [
      'Screen 1 - RGB Laser 4K',
      'Screen 2 - Dolby 7.1 Atmos',
      'Screen 3 - Royal Executive'
    ]
  },
  {
    name: 'Triveni 4K Multiplex: RTC Bus Stand Road, Anantapur',
    slug: 'triveni-4k-multiplex-anantapur',
    address: { street: 'RTC Bus Stand Road', area: 'Kalyandurg Road Junction', pincode: '515001' },
    facilities: ['Qube Digital 4K', 'Dolby Atmos', 'Premium Recliners', 'Snack Bar'],
    supportedFormats: ['2D', '3D', 'IMAX'],
    screenNames: [
      'Screen 1 - 4K Ultra HD',
      'Screen 2 - Qube Digital 3D',
      'Screen 3 - Atmos Premier'
    ]
  }
];

const anantapurScreens = [];
for (const cData of anantapurCinemasData) {
  let cinema = await Cinema.findOne({ slug: cData.slug });
  if (!cinema) {
    cinema = await Cinema.create({
      name: cData.name,
      slug: cData.slug,
      city: anantapurCity._id,
      address: cData.address,
      facilities: cData.facilities,
      supportedFormats: cData.supportedFormats,
      isActive: true
    });
    console.log(`Created cinema: ${cinema.name}`);
  }

  for (const sName of cData.screenNames) {
    let screen = await Screen.findOne({ cinema: cinema._id, name: sName });
    if (!screen) {
      screen = await Screen.create({
        cinema: cinema._id,
        name: sName,
        seatingLayout: standardLayout(),
        seatCategories,
        isActive: true
      });
      console.log(`  Added screen: ${screen.name} to ${cinema.name}`);
    }
    anantapurScreens.push({ cinema, screen });
  }
}
console.log(`Total Anantapur screens available for scheduling: ${anantapurScreens.length}`);

// 3. Clean up existing shows & showseats to re-seed cleanly
console.log('\n--- Step 3: Clearing Old Shows & ShowSeats ---');
await ShowSeat.deleteMany({});
await Show.deleteMany({});
console.log('Cleared existing shows and showseats.');

// 4. Generate Shows & ShowSeats
console.log('\n--- Step 4: Generating Multi-Language Shows (5+ shows per language, all dates) ---');

// Dates: 8 days starting Nov 2, 2026
const allCinemas = await Cinema.find({ isActive: true }).lean();
const allScreens = await Screen.find({ isActive: true }).lean();
const screensByCinema = new Map();
for (const s of allScreens) {
  const cid = s.cinema.toString();
  if (!screensByCinema.has(cid)) screensByCinema.set(cid, []);
  screensByCinema.get(cid).push(s);
}

const allMoviesList = await Movie.find({ isActive: true }).lean();
const languagesList = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];

// Base time slots for days
// Today (Day 0) is Nov 2, current time is ~18:45, so schedule evening/night slots:
const todayTimeSlots = [
  { h: 19, m: 15 },
  { h: 19, m: 45 },
  { h: 20, m: 15 },
  { h: 20, m: 45 },
  { h: 21, m: 15 },
  { h: 21, m: 45 },
  { h: 22, m: 15 },
  { h: 22, m: 45 },
  { h: 23, m: 15 }
];

const futureTimeSlots = [
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

let showDocsToInsert = [];
let seatDocsToInsert = [];
let totalShowCount = 0;

// Helper to schedule a show
function buildShow({ movie, cinema, screen, startTime, language, format = '2D' }) {
  const durationMs = (movie.durationMinutes || 150) * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);
  const pricing = pricingConfigs[format] || pricingConfigs['2D'];

  const showId = new mongoose.Types.ObjectId();
  const showDoc = {
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

  // Build seat docs for this show
  const rows = screen.seatingLayout?.rows || [];
  let availableCount = 0;
  const showSeatDocs = [];

  for (const row of rows) {
    const category = row.category || 'Regular';
    const price = pricing[category] || row.basePrice || 200;

    for (const seat of row.seats || []) {
      if (!seat.isAisle) {
        // Randomly simulate ~5-10% booked seats
        const isBooked = Math.random() < 0.08;
        const status = isBooked ? 'booked' : 'available';
        if (status === 'available') availableCount++;

        showSeatDocs.push({
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

  showDoc.availableSeatsCount = availableCount;
  return { showDoc, showSeatDocs };
}

// Flush helper
async function flushBatches() {
  if (showDocsToInsert.length > 0) {
    await Show.insertMany(showDocsToInsert);
    totalShowCount += showDocsToInsert.length;
    showDocsToInsert = [];
  }
  if (seatDocsToInsert.length > 0) {
    await ShowSeat.insertMany(seatDocsToInsert);
    seatDocsToInsert = [];
  }
}

// A. Guarantee Anantapur Shows:
// For EACH movie (top movies and featured), across ALL 8 dates,
// ensure AT LEAST 5 shows for EACH language (Telugu, Hindi, Tamil, Kannada, Malayalam)!
console.log('Seeding Anantapur shows...');

const priorityMovies = allMoviesList.filter(m =>
  ['ranabali', 'pushpa-2-the-rule', 'kalki-2898-ad', 'devara-part-1', 'jailer-2', 'premane-oorilo', '418', 'stree-2-sarkate-ka-aatank', 'fighter'].includes(m.slug)
);

// We'll iterate 8 days
for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
  const showDate = new Date();
  showDate.setDate(showDate.getDate() + dayOffset);
  const slots = dayOffset === 0 ? todayTimeSlots : futureTimeSlots;

  for (const movie of priorityMovies) {
    const movieLangs = movie.languages && movie.languages.length > 0 ? movie.languages : languagesList;

    // For EACH language of this movie:
    for (const lang of movieLangs) {
      if (!languagesList.includes(lang) && lang !== 'English') continue;

      // We need 5 shows for this language on this date!
      for (let showIdx = 0; showIdx < 5; showIdx++) {
        // Pick an Anantapur screen and cinema
        const screenPair = anantapurScreens[(showIdx + dayOffset) % anantapurScreens.length];
        const timeSlot = slots[(showIdx * 2 + dayOffset) % slots.length];

        const startTime = new Date(showDate);
        startTime.setHours(timeSlot.h, timeSlot.m, 0, 0);

        // Formats: 2D, 3D, IMAX
        const format = showIdx === 0 ? 'IMAX' : (showIdx === 1 ? '3D' : '2D');

        const { showDoc, showSeatDocs } = buildShow({
          movie,
          cinema: screenPair.cinema,
          screen: screenPair.screen,
          startTime,
          language: lang,
          format
        });

        showDocsToInsert.push(showDoc);
        seatDocsToInsert.push(...showSeatDocs);

        if (seatDocsToInsert.length >= 5000) {
          await flushBatches();
        }
      }
    }
  }
}
await flushBatches();
console.log(`Anantapur shows created: ${totalShowCount}`);

// B. Seed shows for all other cities and cinemas
console.log('Seeding other cities...');
const nonAnantapurCinemas = allCinemas.filter(c => c.city?.toString() !== anantapurCity._id.toString());

for (const cinema of nonAnantapurCinemas) {
  const screens = screensByCinema.get(cinema._id.toString()) || [];
  if (screens.length === 0) continue;

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const showDate = new Date();
    showDate.setDate(showDate.getDate() + dayOffset);
    const slots = dayOffset === 0 ? todayTimeSlots : futureTimeSlots;

    for (let sIdx = 0; sIdx < screens.length; sIdx++) {
      const screen = screens[sIdx];

      // Schedule 6 shows per screen per day
      for (let slotIdx = 0; slotIdx < Math.min(6, slots.length); slotIdx++) {
        const timeSlot = slots[slotIdx * 2 % slots.length];
        const startTime = new Date(showDate);
        startTime.setHours(timeSlot.h, timeSlot.m, 0, 0);

        const movie = allMoviesList[(slotIdx + sIdx + dayOffset) % allMoviesList.length];
        const langs = movie.languages || ['Telugu'];
        const language = langs[slotIdx % langs.length];
        const format = sIdx === 0 ? 'IMAX' : (slotIdx % 2 === 0 ? '3D' : '2D');

        const { showDoc, showSeatDocs } = buildShow({
          movie,
          cinema,
          screen,
          startTime,
          language,
          format
        });

        showDocsToInsert.push(showDoc);
        seatDocsToInsert.push(...showSeatDocs);

        if (seatDocsToInsert.length >= 5000) {
          await flushBatches();
        }
      }
    }
  }
}
await flushBatches();

console.log(`\n🎉 Total Shows Seeded: ${await Show.countDocuments()}`);
console.log(`🎉 Total ShowSeats Seeded: ${await ShowSeat.countDocuments()}`);

// 5. Verification Checks
console.log('\n--- Step 5: Verification of Anantapur Shows ---');
const anantapurCinemaDocs = await Cinema.find({ city: anantapurCity._id }).lean();
const anantapurCids = anantapurCinemaDocs.map(c => c._id);

const ranabali = await Movie.findOne({ slug: 'ranabali' }).lean();
console.log(`Ranabali ID: ${ranabali._id}, trailerUrl: ${ranabali.trailerUrl}`);

// Check shows for Ranabali in Anantapur across all 8 dates
for (let d = 0; d <= 7; d++) {
  const target = new Date();
  target.setDate(target.getDate() + d);
  const startOfDay = new Date(target.setHours(0, 0, 0, 0));
  const endOfDay = new Date(target.setHours(23, 59, 59, 999));

  const count = await Show.countDocuments({
    movie: ranabali._id,
    cinema: { $in: anantapurCids },
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: 'scheduled'
  });

  const dStr = startOfDay.toISOString().split('T')[0];
  console.log(`Date: ${dStr} -> Ranabali has ${count} shows in Anantapur`);
}

// Check Ranabali shows by language in Anantapur
console.log('\nRanabali shows by language in Anantapur:');
for (const l of ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']) {
  const count = await Show.countDocuments({
    movie: ranabali._id,
    cinema: { $in: anantapurCids },
    language: l,
    status: 'scheduled'
  });
  console.log(`  - ${l}: ${count} shows`);
}

await mongoose.disconnect();
console.log('\nSeed script completed successfully!');

