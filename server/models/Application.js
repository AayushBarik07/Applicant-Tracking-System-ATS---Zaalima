const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  resumePath: {
    type: String,
    required: true,
  },
  resumeText: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offered', 'Rejected'],
    default: 'Applied',
  },
  candidateInterviewResponse: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  },
  candidateOfferResponse: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  },
  aiScore: {
    type: Number,
  },
  aiSummary: {
    type: String,
  },
  extractedSkills: {
    type: [String],
    default: [],
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
  },
  education: {
    type: String,
  }
}, {
  timestamps: true // Automatically adds createdAt as appliedAt, and updatedAt
});

module.exports = mongoose.model('Application', applicationSchema);
