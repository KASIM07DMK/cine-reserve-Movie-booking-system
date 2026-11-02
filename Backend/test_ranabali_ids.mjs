const ids = [
  '4AejYUbJiDs',
  'eItYEP2Gkks',
  'QF0NQyZ_5KU',
  '5QcurZqORPI',
  'tpPerNddzTQ',
  'H95G1WgLHLU'
];

for (const id of ids) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    console.log(id, res.status, res.status === 200 ? (await res.json()).title : '');
  } catch (e) {
    console.log(id, 'ERR', e.message);
  }
}

