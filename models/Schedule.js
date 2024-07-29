const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  scheduleLink: {
    type: String,
  },
  scheduleSubject: {
    type: String,
    required: true
  },
  scheduleDescription: {
    type: String
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed','waitingToApproved']
  },
  // gender, fullName, user age will be fetched using userId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
