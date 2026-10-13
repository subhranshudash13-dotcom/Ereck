const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    unique: true,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
  },
  eventTitle: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number / Student ID is required'],
    trim: true,
  },
  branch: {
    type: String,
    required: [true, 'Branch / Department is required'],
    trim: true,
  },
  year: {
    type: String,
    required: [true, 'Academic Year is required'],
  },
  college: {
    type: String,
    default: 'NIT Kurukshetra',
    trim: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique registration per student per event in MongoDB
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
