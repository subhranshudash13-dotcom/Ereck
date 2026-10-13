const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technical', 'Cultural', 'Sports'],
  },
  tagline: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  date: {
    type: String,
    required: [true, 'Event date string is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
  },
  image: {
    type: String,
    default: '/assets/events/technical.jpg',
  },
  capacity: {
    type: Number,
    default: 100,
  },
  registrationCount: {
    type: Number,
    default: 0,
  },
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema);
