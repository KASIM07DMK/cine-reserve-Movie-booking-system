import fs from 'fs';
import path from 'path';

const outDir = 'c:/Users/dmkmo/OneDrive/Desktop/Movie Booking System/Frontend/public/posters';
const distDir = 'c:/Users/dmkmo/OneDrive/Desktop/Movie Booking System/Frontend/dist/posters';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

async function download(url, filename) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (res.status === 200) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(path.join(outDir, filename), buf);
      fs.writeFileSync(path.join(distDir, filename), buf);
      console.log(`✅ Saved ${filename} (${buf.byteLength} bytes)`);
    } else {
      console.log(`❌ Failed ${filename}: status ${res.status}`);
    }
  } catch (e) {
    console.log(`❌ Error ${filename}: ${e.message}`);
  }
}

// 1. Devara
await download('https://upload.wikimedia.org/wikipedia/en/f/f0/Devara_Part_1.jpg', 'devara.jpg');
await download('https://img.youtube.com/vi/yEffTqkDBdY/maxresdefault.jpg', 'devara-backdrop.jpg');

// 2. Stree 2
await download('https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg', 'stree2.jpg');
await download('https://img.youtube.com/vi/VlvOgk5BHS4/maxresdefault.jpg', 'stree2-backdrop.jpg');

// 3. Fighter
await download('https://upload.wikimedia.org/wikipedia/en/d/df/Fighter_film_teaser.jpg', 'fighter.jpg');
await download('https://img.youtube.com/vi/6amIq_mP4xM/maxresdefault.jpg', 'fighter-backdrop.jpg');

// 4. Kalki 2898 AD
await download('https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg', 'kalki2898ad.jpg');
await download('https://img.youtube.com/vi/kQDd1AhGIHk/maxresdefault.jpg', 'kalki2898ad-backdrop.jpg');

