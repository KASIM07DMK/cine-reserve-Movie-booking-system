const res = await fetch('https://en.wikipedia.org/wiki/Stree_2', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const html = await res.text();
const match = html.match(/upload\.wikimedia\.org\/wikipedia\/en\/[a-z0-9\/%._-]+\.(?:jpg|jpeg|png)/i);
console.log('Stree 2 poster match:', match ? match[0] : 'None');

