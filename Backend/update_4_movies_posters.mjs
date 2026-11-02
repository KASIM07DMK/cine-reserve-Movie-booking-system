import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');

const Movie = mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));

const updates = [
  {
    slug: 'devara-part-1',
    posterUrl: '/posters/devara.jpg',
    backdropUrl: '/posters/devara-backdrop.jpg'
  },
  {
    slug: 'stree-2-sarkate-ka-aatank',
    posterUrl: '/posters/stree2.jpg',
    backdropUrl: '/posters/stree2-backdrop.jpg'
  },
  {
    slug: 'fighter',
    posterUrl: '/posters/fighter.jpg',
    backdropUrl: '/posters/fighter-backdrop.jpg'
  },
  {
    slug: 'kalki-2898-ad',
    posterUrl: '/posters/kalki2898ad.jpg',
    backdropUrl: '/posters/kalki2898ad-backdrop.jpg'
  }
];

for (const u of updates) {
  const res = await Movie.updateOne(
    { slug: u.slug },
    { $set: { posterUrl: u.posterUrl, backdropUrl: u.backdropUrl } }
  );
  console.log(`Updated ${u.slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
}

// Print verification
for (const u of updates) {
  const m = await Movie.findOne({ slug: u.slug }).lean();
  console.log(`\nMovie: ${m.title} (${m.slug})`);
  console.log(`  posterUrl: ${m.posterUrl}`);
  console.log(`  backdropUrl: ${m.backdropUrl}`);
  console.log(`  trailerUrl: ${m.trailerUrl}`);
}

await mongoose.disconnect();
console.log('\nAll 4 movie posters updated successfully in DB!');

