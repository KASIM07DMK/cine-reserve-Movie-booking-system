import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { City } from '../models/City.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Coupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { TicketValidation } from '../models/TicketValidation.js';
import { config } from '../config/env.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seeder] Connected to MongoDB.');

    // Clean existing operational collections for fresh dev environment
    console.log('[Seeder] Cleaning existing development records...');
    await Promise.all([
      User.deleteMany({}),
      City.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Screen.deleteMany({}),
      Show.deleteMany({}),
      ShowSeat.deleteMany({}),
      Coupon.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      TicketValidation.deleteMany({})
    ]);

    // 1. Create Default Users
    console.log('[Seeder] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@123', salt);
    const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);

    await User.create([
      {
        name: 'Chief Admin',
        email: 'admin@cinereserve.com',
        passwordHash: adminPasswordHash,
        phone: '+91 9888800001',
        role: 'admin'
      },
      {
        name: 'Rahul Sharma',
        email: 'demo@cinereserve.com',
        passwordHash: demoPasswordHash,
        phone: '+91 9888800002',
        role: 'user'
      }
    ]);

    // 2. Create Cities
    console.log('[Seeder] Creating cities...');
    const cityData = [
      { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', isPopular: true },
      { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', isPopular: true },
      { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', isPopular: true },
      { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', isPopular: true },
      { name: 'Delhi', slug: 'delhi', state: 'Delhi NCR', isPopular: true },
      { name: 'Vijayawada', slug: 'vijayawada', state: 'Andhra Pradesh', isPopular: true },
      { name: 'Visakhapatnam', slug: 'visakhapatnam', state: 'Andhra Pradesh', isPopular: true },
      { name: 'Kurnool', slug: 'kurnool', state: 'Andhra Pradesh', isPopular: true },
      { name: 'Anantapur', slug: 'anantapur', state: 'Andhra Pradesh', isPopular: true },
      { name: 'Kadapa', slug: 'kadapa', state: 'Andhra Pradesh', isPopular: true },
      { name: 'Nellore', slug: 'nellore', state: 'Andhra Pradesh', isPopular: true }
    ];
    const cities = await City.create(cityData);
    const cityMap = new Map(cities.map((c) => [c.slug, c._id]));

    // 3. Create Real & Latest Movies (including user's requested titles)
    console.log('[Seeder] Creating movies...');
    const movieData = [
      {
        title: 'Jailer 2',
        slug: 'jailer-2',
        description:
          'Superstar Rajinikanth returns as Tiger Muthuvel Pandian in this high-octane sequel. When a global syndicate threatens national peace and his family, the retired warden unleashes raw vengeance.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/uYJW7UN3sSlBMfk9O9TpnGH4ND6.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=xenOE1Tma18',
        genres: ['Action', 'Crime', 'Thriller'],
        languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
        durationMinutes: 168,
        releaseDate: new Date('2024-11-20'),
        certification: 'UA',
        director: 'Nelson Dilipkumar',
        cast: ['Rajinikanth', 'Mohanlal', 'Shiva Rajkumar', 'Ramya Krishnan', 'Mirnaa Menon'],
        rating: 9.3,
        ratingSource: 'District Verified Blockbuster',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Ranabali',
        slug: 'ranabali',
        description:
          'A ferocious historical epic of royal lineage, ferocious tribal rebellions, and an unbreakable vow of vengeance across turbulent war-torn ancient territories.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4d/Akhanda_poster.jpg/220px-Akhanda_poster.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/uYJW7UN3sSlBMfk9O9TpnGH4ND6.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=sYI_P4a0lqY',
        genres: ['Action', 'Drama', 'History'],
        languages: ['Telugu', 'Hindi', 'Tamil'],
        durationMinutes: 165,
        releaseDate: new Date('2024-10-18'),
        certification: 'A',
        director: 'Boyapati Srinu',
        cast: ['Nandamuri Balakrishna', 'Bobby Deol', 'Pragya Jaiswal', 'Srikanth'],
        rating: 8.9,
        ratingSource: 'District Audience Choice',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: '418',
        slug: '418',
        description:
          'An intricate investigative mystery thriller. A brilliant forensic intelligence officer must solve an escalating chain of impossible locked-room homicides all signed with code 418.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Hit_2_poster.jpg/220px-Hit_2_poster.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/cjEcqdRhQz4MZEZ2vy0EEpjO6tH.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgFBZno',
        genres: ['Crime', 'Mystery', 'Thriller'],
        languages: ['Telugu', 'Tamil', 'Hindi'],
        durationMinutes: 142,
        releaseDate: new Date('2024-11-08'),
        certification: 'UA',
        director: 'Prasanth Varma',
        cast: ['Adivi Sesh', 'Mrunal Thakur', 'Naveen Chandra', 'Rao Ramesh'],
        rating: 8.7,
        ratingSource: 'Critics Choice Score',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Premane Oorilo',
        slug: 'premane-oorilo',
        description:
          'A heartwarming rustic romantic drama set in lush Godavari countryside. Two childhood sweethearts fight traditional village disputes with love, family warmth, and soulful festive melodies.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Hi_Nanna_poster.jpg/220px-Hi_Nanna_poster.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/pVGzV15BxZrFOTPPTALvCfasFVt.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=KVnhefZv29g',
        genres: ['Romance', 'Comedy', 'Drama'],
        languages: ['Telugu', 'Kannada', 'Malayalam'],
        durationMinutes: 148,
        releaseDate: new Date('2024-10-25'),
        certification: 'UA',
        director: 'Shiva Nirvana',
        cast: ['Vijay Deverakonda', 'Sreeleela', 'Vennela Kishore', 'Murali Sharma'],
        rating: 8.5,
        ratingSource: 'District Romance Verified',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Pushpa 2: The Rule',
        slug: 'pushpa-2-the-rule',
        description:
          'Pushpa Raj expands his red sanders syndicate beyond state borders while squaring off with ruthless SP Bhanwar Singh Shekhawat in a fiery battle for supremacy.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgFBZno',
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
        durationMinutes: 200,
        releaseDate: new Date('2024-12-05'),
        certification: 'UA',
        director: 'Sukumar',
        cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
        rating: 9.1,
        ratingSource: 'District & BookMyShow Verified',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        description:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and destiny, he endeavors to prevent a terrible future.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/lzWHmYdfeFiMIY4JaMmtR7GEli3.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        languages: ['English', 'Hindi'],
        durationMinutes: 166,
        releaseDate: new Date('2024-03-01'),
        certification: 'UA',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
        rating: 9.2,
        ratingSource: 'IMDb / District Verified',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Deadpool & Wolverine',
        slug: 'deadpool-and-wolverine',
        description:
          'A listless Wade Wilson toils away in civilian life with his days as Deadpool behind him. When his homeworld faces existential extinction, he reluctantly recruits an even more reluctant Wolverine.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        languages: ['English', 'Hindi', 'Telugu', 'Tamil'],
        durationMinutes: 128,
        releaseDate: new Date('2024-07-26'),
        certification: 'A',
        director: 'Shawn Levy',
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
        rating: 8.9,
        ratingSource: 'District Audience Choice',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Kalki 2898 AD',
        slug: 'kalki-2898-ad',
        description:
          'Set in a dystopian post-apocalyptic future in the year 2898 AD, Bhairava and the ancient immortal Ashwatthama clash over the fate of an unborn prophesied avatar.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        genres: ['Action', 'Sci-Fi', 'Fantasy'],
        languages: ['Telugu', 'Hindi', 'English', 'Tamil'],
        durationMinutes: 181,
        releaseDate: new Date('2024-06-27'),
        certification: 'UA',
        director: 'Nag Ashwin',
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
        rating: 8.8,
        ratingSource: 'CineReserve Verified',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Gladiator II',
        slug: 'gladiator-ii',
        description:
          'Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors.',
        posterUrl: 'https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genres: ['Action', 'Drama', 'Adventure'],
        languages: ['English', 'Hindi'],
        durationMinutes: 148,
        releaseDate: new Date('2024-11-15'),
        certification: 'A',
        director: 'Ridley Scott',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        rating: 8.7,
        ratingSource: 'Critics Choice',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Stree 2: Sarkate Ka Aatank',
        slug: 'stree-2-sarkate-ka-aatank',
        description:
          'The small town of Chanderi is plagued by a new headless ghost named Sarkata that abducts modern women. Vicky and his friends must unite with the mysterious witch Stree to save the town.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=KVnhefZv29g',
        genres: ['Comedy', 'Horror'],
        languages: ['Hindi'],
        durationMinutes: 147,
        releaseDate: new Date('2024-08-15'),
        certification: 'UA',
        director: 'Amar Kaushik',
        cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee'],
        rating: 8.6,
        ratingSource: 'District Verified',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Oppenheimer',
        slug: 'oppenheimer',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genres: ['Biography', 'Drama', 'History'],
        languages: ['English', 'Hindi'],
        durationMinutes: 180,
        releaseDate: new Date('2023-07-21'),
        certification: 'A',
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        rating: 9.3,
        ratingSource: 'Academy Award Winner',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Interstellar: 10th Anniversary IMAX',
        slug: 'interstellar-10th-anniversary',
        description:
          'When Earth becomes uninhabitable, a team of intrepid explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        languages: ['English', 'Hindi'],
        durationMinutes: 169,
        releaseDate: new Date('2024-11-01'),
        certification: 'PG-13',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        rating: 9.4,
        ratingSource: 'IMDb Top Rated',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Devara: Part 1',
        slug: 'devara-part-1',
        description:
          'A brave tribal leader sets out to protect his coastal homeland from ruthless smugglers and treacherous betrayals on stormy perilous waters.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f0/Devara_Part_1.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=sYI_P4a0lqY',
        genres: ['Action', 'Drama', 'Thriller'],
        languages: ['Telugu', 'Hindi', 'Tamil'],
        durationMinutes: 178,
        releaseDate: new Date('2024-09-27'),
        certification: 'A',
        director: 'Koratala Siva',
        cast: ['N. T. Rama Rao Jr.', 'Saif Ali Khan', 'Janhvi Kapoor', 'Prakash Raj'],
        rating: 8.4,
        ratingSource: 'District Score',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Fighter',
        slug: 'fighter',
        description:
          'Top IAF aviators come together in the face of imminent danger to form Air Dragons, willing to give everything for their nation.',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5b/Fighter_film_poster.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1517976487507-59a5e8869c84?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=6amIq_OKP4k',
        genres: ['Action', 'Thriller', 'War'],
        languages: ['Hindi', 'Telugu'],
        durationMinutes: 166,
        releaseDate: new Date('2024-01-25'),
        certification: 'UA',
        director: 'Siddharth Anand',
        cast: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor'],
        rating: 8.3,
        ratingSource: 'Audience Score',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Avatar: Fire and Ash',
        slug: 'avatar-fire-and-ash',
        description:
          'Jake Sully and Neytiri travel across Pandora where they encounter the Ash People, a volcanic clan of Na\'vi with distinct aggressive customs.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        languages: ['English', 'Hindi', 'Telugu'],
        durationMinutes: 190,
        releaseDate: new Date('2025-12-19'),
        certification: 'UA',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
        rating: 9.5,
        ratingSource: 'Anticipation Score',
        status: 'upcoming',
        isFeatured: false
      }
    ];

    const movies = await Movie.create(movieData);

    // 4. Create Real Cinemas across all cities
    console.log('[Seeder] Creating theatres and multiplexes...');
    const cinemaData = [
      // Hyderabad
      {
        name: 'AMB Cinemas: Gachibowli',
        slug: 'amb-cinemas-gachibowli',
        city: cityMap.get('hyderabad'),
        address: { street: 'Sarath City Capital Mall, Gachibowli', area: 'Gachibowli', pincode: '500084' },
        facilities: ['Laser IMAX', 'Dolby Atmos', 'VIP Recliner Lounge', 'Gourmet Food', 'Valet Parking'],
        supportedFormats: ['2D', '3D', 'IMAX']
      },
      {
        name: 'Prasads Multiplex: NTR Marg',
        slug: 'prasads-multiplex-ntr-marg',
        city: cityMap.get('hyderabad'),
        address: { street: 'NTR Gardens, Khairatabad', area: 'Khairatabad', pincode: '500063' },
        facilities: ['Large Screen PCX', 'Dolby Atmos', 'Gaming Zone', 'Wheelchair Accessible'],
        supportedFormats: ['2D', '3D', 'IMAX', '4DX']
      },
      {
        name: 'PVR INOX Forum Mall: Kukatpally',
        slug: 'pvr-inox-forum-mall-kukatpally',
        city: cityMap.get('hyderabad'),
        address: { street: 'Forum Sujana Mall, KPHB Phase 9', area: 'Kukatpally', pincode: '500072' },
        facilities: ['4DX', 'Dolby Atmos', 'Recliner Seating', 'Food Lounge'],
        supportedFormats: ['2D', '3D', '4DX']
      },

      // Bengaluru
      {
        name: 'PVR Gold Class: Forum Koramangala',
        slug: 'pvr-gold-class-forum-koramangala',
        city: cityMap.get('bengaluru'),
        address: { street: 'Hosur Road, Koramangala', area: 'Koramangala', pincode: '560095' },
        facilities: ['Gold Class', 'IMAX with Laser', 'Dolby Atmos', 'Fine Dining'],
        supportedFormats: ['2D', '3D', 'IMAX']
      },
      {
        name: 'INOX Megaplex: Garuda Mall',
        slug: 'inox-megaplex-garuda-mall',
        city: cityMap.get('bengaluru'),
        address: { street: 'Magrath Road, Ashok Nagar', area: 'Ashok Nagar', pincode: '560025' },
        facilities: ['Dolby Atmos', 'ScreenX', 'VIP Recliners', 'Cafeteria'],
        supportedFormats: ['2D', '3D']
      },

      // Mumbai
      {
        name: 'PVR ICON: Infiniti Mall Andheri',
        slug: 'pvr-icon-infiniti-mall-andheri',
        city: cityMap.get('mumbai'),
        address: { street: 'Link Road, Andheri West', area: 'Andheri West', pincode: '400053' },
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Boutique Lounge', 'Valet Parking'],
        supportedFormats: ['2D', '3D', 'IMAX']
      },
      {
        name: 'INOX Megaplex: Inorbit Mall Malad',
        slug: 'inox-megaplex-inorbit-malad',
        city: cityMap.get('mumbai'),
        address: { street: 'Link Road, Malad West', area: 'Malad West', pincode: '400064' },
        facilities: ['ScreenX', 'MX4D', 'Dolby Atmos', 'Kidles Screen'],
        supportedFormats: ['2D', '3D', '4DX']
      },

      // Chennai
      {
        name: 'PVR SPI Palazzo: Forum Vijaya Mall',
        slug: 'pvr-spi-palazzo-forum-vijaya-mall',
        city: cityMap.get('chennai'),
        address: { street: 'Arcot Road, Vadapalani', area: 'Vadapalani', pincode: '600026' },
        facilities: ['IMAX', 'Dolby Atmos', 'Italian Marble Lounge', 'Gourmet Popcorn'],
        supportedFormats: ['2D', '3D', 'IMAX']
      },
      {
        name: 'AGS Cinemas: T Nagar',
        slug: 'ags-cinemas-t-nagar',
        city: cityMap.get('chennai'),
        address: { street: 'G.N. Chetty Road, T. Nagar', area: 'T. Nagar', pincode: '600017' },
        facilities: ['4K Laser', 'Dolby Atmos', 'Recliner Seats'],
        supportedFormats: ['2D', '3D']
      },

      // Delhi NCR
      {
        name: 'PVR Director\'s Cut: Ambience Mall',
        slug: 'pvr-directors-cut-ambience-mall',
        city: cityMap.get('delhi'),
        address: { street: 'Nelson Mandela Road, Vasant Kunj', area: 'Vasant Kunj', pincode: '110070' },
        facilities: ['Luxe Recliners', 'Concierge Service', 'Dolby Atmos', 'In-Seat Dining'],
        supportedFormats: ['2D', '3D', 'IMAX']
      },

      // Andhra Pradesh Centres
      {
        name: 'PVR Ripples Mall: MG Road',
        slug: 'pvr-ripples-mall-vijayawada',
        city: cityMap.get('vijayawada'),
        address: { street: 'MG Road, Labbipet', area: 'Labbipet', pincode: '520010' },
        facilities: ['Dolby Atmos', '4K Projection', 'Food Court'],
        supportedFormats: ['2D', '3D']
      },
      {
        name: 'Cinepolis Jagadamba Junction',
        slug: 'cinepolis-jagadamba-junction-vizag',
        city: cityMap.get('visakhapatnam'),
        address: { street: 'Jagadamba Centre, Maharanipeta', area: 'Jagadamba', pincode: '530002' },
        facilities: ['Laser 4K', 'Dolby 7.1', 'Executive Seating'],
        supportedFormats: ['2D', '3D']
      },
      {
        name: 'CineReserve Royal Cineplex: Kurnool',
        slug: 'cinereserve-royal-cineplex-kurnool',
        city: cityMap.get('kurnool'),
        address: { street: 'RS Road, Near Railway Station', area: 'Station Road', pincode: '518001' },
        facilities: ['Dolby Atmos', 'Pushback Chairs', 'Food Court'],
        supportedFormats: ['2D', '3D']
      },
      {
        name: 'CineReserve Grand Theatre: Anantapur',
        slug: 'cinereserve-grand-theatre-anantapur',
        city: cityMap.get('anantapur'),
        address: { street: 'Subash Road, Old Town', area: 'Subash Road', pincode: '515001' },
        facilities: ['4K RGB Laser', 'Dolby Atmos', 'Cafeteria'],
        supportedFormats: ['2D', '3D']
      },
      {
        name: 'CineReserve Raja Complex: Kadapa',
        slug: 'cinereserve-raja-complex-kadapa',
        city: cityMap.get('kadapa'),
        address: { street: 'RTC Bus Stand Road', area: 'City Center', pincode: '516001' },
        facilities: ['Dolby Sound', 'Comfort Recliners', 'Snack Bar'],
        supportedFormats: ['2D', '3D']
      },
      {
        name: 'CineReserve S2 Multiplex: Nellore',
        slug: 'cinereserve-s2-multiplex-nellore',
        city: cityMap.get('nellore'),
        address: { street: 'Pogathota Main Road', area: 'Pogathota', pincode: '524001' },
        facilities: ['Dolby Atmos', 'VIP Seating', 'Parking'],
        supportedFormats: ['2D', '3D']
      }
    ];

    const cinemas = await Cinema.create(cinemaData);

    // 5. Helper to generate realistic tiered seating matrix for each theatre screen
    const buildScreenLayout = () => {
      // 8 rows: A to H
      // Rows A, B: Recliner (base ₹450)
      // Rows C, D, E: Premium (base ₹300)
      // Rows F, G, H: Regular (base ₹180)
      const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const rows = rowLabels.map((label) => {
        let category = 'Regular';
        let basePrice = 180;
        if (['A', 'B'].includes(label)) {
          category = 'Recliner';
          basePrice = 450;
        } else if (['C', 'D', 'E'].includes(label)) {
          category = 'Premium';
          basePrice = 300;
        }

        const seats = [];
        for (let num = 1; num <= 12; num++) {
          seats.push({
            seatNumber: num,
            isAisle: num === 4 || num === 9, // Wide cinema aisle spacing
            isBlocked: false
          });
        }

        return {
          rowLabel: label,
          category,
          basePrice,
          seats
        };
      });

      return {
        totalRows: 8,
        totalColumns: 12,
        rows
      };
    };

    // 6. Create Screens for each Cinema
    console.log('[Seeder] Creating screens and seat matrices for each cinema...');
    const screens = [];
    for (const cinema of cinemas) {
      const screen1 = await Screen.create({
        cinema: cinema._id,
        name: 'Audi 1 - Dolby Atmos 4K',
        seatingLayout: buildScreenLayout(),
        seatCategories: [
          { name: 'Regular', color: '#3B82F6', defaultPrice: 180 },
          { name: 'Premium', color: '#10B981', defaultPrice: 300 },
          { name: 'Recliner', color: '#F59E0B', defaultPrice: 450 }
        ]
      });

      const screen2 = await Screen.create({
        cinema: cinema._id,
        name: 'Audi 2 - IMAX with Laser',
        seatingLayout: buildScreenLayout(),
        seatCategories: [
          { name: 'Regular', color: '#3B82F6', defaultPrice: 220 },
          { name: 'Premium', color: '#10B981', defaultPrice: 380 },
          { name: 'Recliner', color: '#F59E0B', defaultPrice: 550 }
        ]
      });

      screens.push(screen1, screen2);
    }

    // 7. Create Scheduled Shows for ALL now_showing movies
    console.log('[Seeder] Scheduling showtimes and atomic seat matrices for all movies...');
    const now = new Date();
    const activeMovies = movies.filter((m) => m.status === 'now_showing');

    const baseTimeSlots = [
      { hours: 10, minutes: 0 },
      { hours: 13, minutes: 30 },
      { hours: 17, minutes: 0 },
      { hours: 20, minutes: 45 }
    ];

    // Seed 3 active booking days: Today, Tomorrow, Day after tomorrow
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      const showDay = new Date();
      showDay.setDate(now.getDate() + dayOffset);

      for (const cinema of cinemas) {
        const cinemaScreens = screens.filter((s) => s.cinema.toString() === cinema._id.toString());

        // Schedule all active movies across the cinema screens
        for (let mIdx = 0; mIdx < activeMovies.length; mIdx++) {
          const movie = activeMovies[mIdx];
          const screen = cinemaScreens[mIdx % cinemaScreens.length];

          // Pick 1-2 slots per movie per cinema per day
          const slot = baseTimeSlots[(mIdx + dayOffset) % baseTimeSlots.length];
          let startTime = new Date(showDay);
          startTime.setHours(slot.hours, slot.minutes, 0, 0);

          // For TODAY (dayOffset === 0), ensure shows are in the FUTURE from right now
          if (dayOffset === 0 && startTime <= now) {
            startTime = new Date(now.getTime() + (mIdx + 1) * 45 * 60 * 1000);
          }

          const endTime = new Date(startTime.getTime() + (movie.durationMinutes + 15) * 60 * 1000);
          const isImaxScreen = screen.name.includes('IMAX');
          const format = isImaxScreen ? 'IMAX' : mIdx % 2 === 0 ? '2D' : '3D';

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

          // Generate ShowSeats from screen seatingLayout
          const seatDocs = [];
          for (const row of screen.seatingLayout.rows) {
            const category = row.category;
            const price = pricingConfiguration[category];

            for (const seat of row.seats) {
              const isRandomlyBooked = Math.random() < 0.15;
              seatDocs.push({
                show: show._id,
                seatCode: `${row.rowLabel}${seat.seatNumber}`,
                rowLabel: row.rowLabel,
                seatNumber: seat.seatNumber,
                category,
                price,
                isAisle: seat.isAisle,
                status: isRandomlyBooked ? 'booked' : 'available'
              });
            }
          }

          await ShowSeat.insertMany(seatDocs, { ordered: false });

          const availableSeatsCount = seatDocs.filter((s) => s.status === 'available' && !s.isAisle).length;
          await Show.findByIdAndUpdate(show._id, {
            totalSeats: seatDocs.filter((s) => !s.isAisle).length,
            availableSeatsCount
          });
        }
      }
    }

    // 8. Create Promotional Coupons
    console.log('[Seeder] Creating promotional coupons...');
    await Coupon.create([
      {
        code: 'CINERESERVE50',
        description: 'Get 50% discount up to ₹150 on your booking',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 150,
        minBookingAmount: 250,
        validUntil: new Date('2028-12-31'),
        usageLimit: 50000,
        isActive: true
      },
      {
        code: 'BLOCKBUSTER100',
        description: 'Flat ₹100 OFF on any 2 or more tickets',
        discountType: 'fixed',
        discountValue: 100,
        maxDiscountAmount: 100,
        minBookingAmount: 350,
        validUntil: new Date('2028-12-31'),
        usageLimit: 50000,
        isActive: true
      },
      {
        code: 'FIRSTSHOW',
        description: 'Flat ₹75 instant discount for moviegoers',
        discountType: 'fixed',
        discountValue: 75,
        maxDiscountAmount: 75,
        minBookingAmount: 200,
        validUntil: new Date('2028-12-31'),
        usageLimit: 50000,
        isActive: true
      }
    ]);

    console.log('========================================================');
    console.log('✅ CineReserve Real Theatres & Shows Seeding Completed!');
    console.log('========================================================');
    console.log(`🎬 Total Movies Seeded:  ${movies.length}`);
    console.log(`🏢 Total Cinemas Seeded: ${cinemas.length} across 11 cities`);
    console.log('Sample Accounts:');
    console.log('👤 Admin: admin@cinereserve.com / Admin@12345');
    console.log('👤 User:  demo@cinereserve.com  / Demo@123');
    console.log('========================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seeding Error]', err);
    process.exit(1);
  }
};

seedDatabase();
