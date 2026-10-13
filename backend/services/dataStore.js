const { getIsConnected } = require('../config/db');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Default initial seed data for events
const initialEvents = [
  {
    _id: '670000000000000000000001',
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
    createdAt: new Date('2026-10-01T10:00:00Z'),
  },
  {
    _id: '670000000000000000000002',
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
    createdAt: new Date('2026-10-02T10:00:00Z'),
  },
  {
    _id: '670000000000000000000003',
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
    createdAt: new Date('2026-10-03T10:00:00Z'),
  },
];

// In-memory collections for graceful offline execution
let memoryEvents = JSON.parse(JSON.stringify(initialEvents));
let memoryRegistrations = [];

let regCounter = 100;

const generateRegId = () => {
  regCounter += 1;
  return `ER-2026-${String(regCounter).padStart(5, '0')}`;
};

// Seed MongoDB if empty on startup
const seedMongoIfEmpty = async () => {
  if (!getIsConnected()) return;
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial events to MongoDB...');
      await Event.insertMany(initialEvents);
      console.log('[Seed] Default events inserted successfully.');
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

const DataStore = {
  seedMongoIfEmpty,

  async getEvents(category) {
    if (getIsConnected()) {
      const query = category && category !== 'All' ? { category } : {};
      const events = await Event.find(query).sort({ createdAt: 1 }).lean();
      for (const event of events) {
        event.registrationCount = await Registration.countDocuments({ eventId: event._id });
      }
      return events;
    }
    let events = memoryEvents;
    if (category && category !== 'All') {
      events = memoryEvents.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }
    return events.map((e) => ({
      ...e,
      registrationCount: memoryRegistrations.filter((r) => r.eventId.toString() === e._id.toString()).length,
    }));
  },

  async getEventById(id) {
    if (getIsConnected()) {
      try {
        const event = await Event.findById(id).lean();
        if (event) {
          event.registrationCount = await Registration.countDocuments({ eventId: event._id });
        }
        return event;
      } catch (err) {
        return null;
      }
    }
    const event = memoryEvents.find((e) => e._id.toString() === id.toString());
    if (!event) return null;
    return {
      ...event,
      registrationCount: memoryRegistrations.filter((r) => r.eventId.toString() === event._id.toString()).length,
    };
  },

  async createEvent(eventData) {
    if (getIsConnected()) {
      const newEvent = new Event(eventData);
      return await newEvent.save();
    }
    const newEvent = {
      _id: '67000000000000000000' + String(Date.now()).slice(-4),
      registrationCount: 0,
      registrationOpen: true,
      createdAt: new Date(),
      ...eventData,
    };
    memoryEvents.push(newEvent);
    return newEvent;
  },

  async updateEvent(id, updateData) {
    if (getIsConnected()) {
      return await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }
    const index = memoryEvents.findIndex((e) => e._id.toString() === id.toString());
    if (index === -1) return null;
    memoryEvents[index] = { ...memoryEvents[index], ...updateData };
    return memoryEvents[index];
  },

  async deleteEvent(id) {
    if (getIsConnected()) {
      await Registration.deleteMany({ eventId: id });
      return await Event.findByIdAndDelete(id);
    }
    const index = memoryEvents.findIndex((e) => e._id.toString() === id.toString());
    if (index === -1) return null;
    const removed = memoryEvents.splice(index, 1)[0];
    memoryRegistrations = memoryRegistrations.filter((r) => r.eventId.toString() !== id.toString());
    return removed;
  },

  async getRegistrationsByEvent(eventId) {
    if (getIsConnected()) {
      return await Registration.find({ eventId }).sort({ registeredAt: -1 });
    }
    return memoryRegistrations.filter((r) => r.eventId.toString() === eventId.toString());
  },

  async getAllRegistrations() {
    if (getIsConnected()) {
      return await Registration.find().populate('eventId', 'title category date venue').sort({ registeredAt: -1 });
    }
    return memoryRegistrations.map((r) => {
      const event = memoryEvents.find((e) => e._id.toString() === r.eventId.toString());
      return {
        ...r,
        eventId: event ? { _id: event._id, title: event.title, category: event.category, date: event.date, venue: event.venue } : r.eventId,
      };
    });
  },

  async findExistingRegistration(eventId, email, rollNumber) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNumber.trim();

    if (getIsConnected()) {
      return await Registration.findOne({
        eventId,
        $or: [{ email: cleanEmail }, { rollNumber: cleanRoll }],
      });
    }

    return memoryRegistrations.find(
      (r) =>
        r.eventId.toString() === eventId.toString() &&
        (r.email.toLowerCase() === cleanEmail || r.rollNumber.toLowerCase() === cleanRoll.toLowerCase())
    );
  },

  async createRegistration(regData) {
    const registrationId = generateRegId();
    const cleanData = {
      ...regData,
      registrationId,
      email: regData.email.toLowerCase().trim(),
      registeredAt: new Date(),
    };

    if (getIsConnected()) {
      const reg = new Registration(cleanData);
      const saved = await reg.save();
      await Event.findByIdAndUpdate(regData.eventId, { $inc: { registrationCount: 1 } });
      return saved;
    }

    memoryRegistrations.unshift(cleanData);
    const event = memoryEvents.find((e) => e._id.toString() === regData.eventId.toString());
    if (event) {
      event.registrationCount = (event.registrationCount || 0) + 1;
    }
    return cleanData;
  },

  async getStats() {
    if (getIsConnected()) {
      const totalEvents = await Event.countDocuments();
      const totalRegistrations = await Registration.countDocuments();
      const activeEvents = await Event.countDocuments({ registrationOpen: true });
      return { totalEvents, totalRegistrations, activeEvents };
    }
    return {
      totalEvents: memoryEvents.length,
      totalRegistrations: memoryRegistrations.length,
      activeEvents: memoryEvents.filter((e) => e.registrationOpen !== false).length,
    };
  },
};

module.exports = DataStore;
