import mongoose from 'mongoose';
await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');

const Cinema = mongoose.model('Cinema', new mongoose.Schema({}, { strict: false }));
const Show = mongoose.model('Show', new mongoose.Schema({}, { strict: false }));
const Movie = mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));

const anantapurCinemas = await Cinema.find({ name: /Anantapur/i }).lean();
console.log('Anantapur cinemas:', anantapurCinemas.map(c => c.name));

const anantapurCinemaIds = anantapurCinemas.map(c => c._id);
const anantapurShows = await Show.find({ cinema: { $in: anantapurCinemaIds } }).lean();
console.log('Anantapur shows count:', anantapurShows.length);

const movieMap = new Map();
const allMovies = await Movie.find().lean();
allMovies.forEach(m => movieMap.set(m._id.toString(), m.title));

const showsByMovie = {};
for (const s of anantapurShows) {
  const title = movieMap.get(s.movie?.toString()) || 'Unknown';
  const date = new Date(s.startTime).toISOString().split('T')[0];
  const lang = s.language;
  const key = `${title} | ${date} | ${lang}`;
  showsByMovie[key] = (showsByMovie[key] || 0) + 1;
}
console.log('Sample Anantapur shows breakdown:', Object.entries(showsByMovie).slice(0, 20));

await mongoose.disconnect();

