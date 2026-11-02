const urls = [
  'https://upload.wikimedia.org/wikipedia/en/f/f0/Devara_Part_1.jpg',
  'https://upload.wikimedia.org/wikipedia/en/c/cd/Stree_2.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/df/Fighter_film_teaser.jpg',
  'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg'
];

for (const u of urls) {
  try {
    const res = await fetch(u, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(u.split('/').pop(), res.status, res.headers.get('content-type'));
  } catch (e) {
    console.log(u.split('/').pop(), 'ERR:', e.message);
  }
}

