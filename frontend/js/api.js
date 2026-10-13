/**
 * Electrorec API Service Module
 * Handles all REST API communication with the Express backend
 */

const API_BASE_URL = window.location.origin.includes('http') ? '' : 'http://localhost:5000';

const API = {
  /**
   * Fetch all events or events by category
   * @param {string} category 
   */
  async fetchEvents(category = 'All') {
    try {
      const url = category && category !== 'All' 
        ? `${API_BASE_URL}/api/events?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/api/events`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
      return data.events || [];
    } catch (err) {
      console.warn('[API] Backend request failed, using local event cache:', err.message);
      return API.getLocalFallbackEvents(category);
    }
  },

  /**
   * Fetch single event details by ID
   * @param {string} id 
   */
  async fetchEventById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch event');
      return data.event;
    } catch (err) {
      console.warn('[API] Fetch single event fallback:', err.message);
      const fallbackList = API.getLocalFallbackEvents('All');
      return fallbackList.find(e => e._id === id) || null;
    }
  },

  /**
   * Submit student registration
   * @param {Object} registrationData 
   */
  async submitRegistration(registrationData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed. Please check your details.',
          registrationId: data.registrationId || null,
        };
      }

      return data;
    } catch (err) {
      console.error('[API Error] Registration failed:', err);
      return {
        success: false,
        message: 'Could not connect to registration server. Please ensure the backend is running.',
      };
    }
  },

  /**
   * Client-side fallback events in case static file preview is opened directly
   */
  getLocalFallbackEvents(category = 'All') {
    const list = [
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
      },
    ];

    if (category && category !== 'All') {
      return list.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  }
};
