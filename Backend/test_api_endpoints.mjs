async function runTests() {
  console.log('Testing CineReserve API Endpoints...\n');

  // 1. Health
  const healthRes = await fetch('http://localhost:5000/api/v1/health');
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthRes.status, healthData.message);

  // 2. Anantapur City
  const citiesRes = await fetch('http://localhost:5000/api/v1/cities');
  const citiesData = await citiesRes.json();
  const anantapur = citiesData.data?.find(c => c.name.toLowerCase().includes('anantapur'));
  console.log('2. Anantapur City ID:', anantapur?._id);

  // 3. Ranabali Movie
  const ranabaliRes = await fetch('http://localhost:5000/api/v1/movies/ranabali');
  const ranabaliData = await ranabaliRes.json();
  const movie = ranabaliData.data;
  console.log(`3. Ranabali Details:
     Title: ${movie.title}
     Trailer URL: ${movie.trailerUrl}
     Languages: ${movie.languages?.join(', ')}`);

  // 4. Ranabali Shows in Anantapur for today
  const todayStr = new Date().toISOString().split('T')[0];
  const showsRes = await fetch(`http://localhost:5000/api/v1/movies/${movie._id}/shows?cityId=${anantapur._id}&date=${todayStr}`);
  const showsData = await showsRes.json();
  console.log(`\n4. Ranabali Shows in Anantapur (Today: ${todayStr}):
     Theatres with shows: ${showsData.data?.cinemas?.length}
     Date show counts:`, showsData.data?.dateShowCounts);

  let sampleShowId = null;
  for (const c of showsData.data?.cinemas || []) {
    console.log(`   Theatre: ${c.cinema.name} (${c.shows.length} shows)`);
    if (!sampleShowId && c.shows.length > 0) sampleShowId = c.shows[0].id;
  }

  // 5. Check Language Filters in Anantapur
  console.log('\n5. Language Filter verification in Anantapur:');
  for (const lang of ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam']) {
    const langRes = await fetch(`http://localhost:5000/api/v1/movies/${movie._id}/shows?cityId=${anantapur._id}&date=${todayStr}&language=${lang}`);
    const langData = await langRes.json();
    let totalLangShows = 0;
    for (const c of langData.data?.cinemas || []) {
      totalLangShows += c.shows.length;
    }
    console.log(`   - Language: ${lang} -> ${totalLangShows} shows available today in Anantapur`);
  }

  // 6. Test Tomorrow's shows in Anantapur
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowRes = await fetch(`http://localhost:5000/api/v1/movies/${movie._id}/shows?cityId=${anantapur._id}&date=${tomorrowStr}`);
  const tomorrowData = await tomorrowRes.json();
  let tomorrowTotal = 0;
  for (const c of tomorrowData.data?.cinemas || []) {
    tomorrowTotal += c.shows.length;
  }
  console.log(`\n6. Tomorrow (${tomorrowStr}) in Anantapur: ${tomorrowTotal} shows across ${tomorrowData.data?.cinemas?.length} theatres`);

  // 7. Check Seat Matrix
  if (sampleShowId) {
    const seatRes = await fetch(`http://localhost:5000/api/v1/shows/${sampleShowId}/seats`);
    const seatData = await seatRes.json();
    console.log(`\n7. Seat Matrix for Show ${sampleShowId}:
       Status: ${seatRes.status}
       Total Seats: ${seatData.data?.show?.totalSeats}
       Available Seats: ${seatData.data?.show?.availableSeatsCount}
       Seat rows: ${seatData.data?.screen?.seatingLayout?.rows?.length}`);
  }

  // 8. Test Frontend proxy
  const proxyRes = await fetch('http://localhost:5173/api/v1/health');
  console.log('\n8. Vite Proxy -> Backend connection:', proxyRes.status);
}

runTests().catch(console.error);

