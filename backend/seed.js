const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const initialEvents = [
  {
    title: 'TechX Workshop: Embedded Systems & IoT',
    category: 'Technical',
    tagline: 'Hands-on hardware & microcontroller mastery',
    description: 'Deep dive into microcontrollers, sensors, and IoT prototyping. Build real-time sensor networks and bridge hardware with modern cloud APIs.',
    date: '18 October 2026',
    time: '4:00 PM - 7:00 PM',
    venue: 'Electronics Lab & Innovation Hub',
    image: '/assets/events/technical.jpg',
    capacity: 100,
    registrationCount: 0,
    registrationOpen: true,
  },
  {
    title: 'ElectroFest: Acoustic & Visual Showcase',
    category: 'Cultural',
    tagline: 'The intersection of stage, sound & circuit arts',
    description: 'An electrifying evening of music, digital visuals, interactive soundboards, and cultural performances by talented student creators.',
    date: '22 October 2026',
    time: '6:00 PM - 9:30 PM',
    venue: 'Main University Auditorium',
    image: '/assets/events/cultural.jpg',
    capacity: 150,
    registrationCount: 0,
    registrationOpen: true,
  },
  {
    title: 'Circuit Cup: Tech-Sports & Speed Prototyping',
    category: 'Sports',
    tagline: 'Rapid-fire engineering challenges & robot racing',
    description: 'Test your agility, rapid circuit debugging skills, obstacle bots, and high-energy tech-sports tournaments with your peers.',
    date: '25 October 2026',
    time: '3:00 PM - 6:30 PM',
    venue: 'College Sports Complex Ground',
    image: '/assets/events/sports.jpg',
    capacity: 80,
    registrationCount: 0,
    registrationOpen: true,
  },
];

const seedData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('[Seed] Notice: MongoDB not running locally. In-memory data store will be used during server runtime.');
      process.exit(0);
    }

    console.log('[Seed] Clearing old events and registrations...');
    await Event.deleteMany({});
    await Registration.deleteMany({});

    console.log('[Seed] Inserting fresh sample events...');
    await Event.insertMany(initialEvents);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

seedData();
