const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  // Exact column names from 208-Voterlist Excel file
  AC: {
    type: String,
    trim: true
  },
  Part: {
    type: String,
    trim: true
  },
  'Sr No': {
    type: String,
    trim: true
  },
  'House No': {
    type: String,
    trim: true
  },
  'Voter Name': {
    type: String,
    trim: true
  },
  'Voter Name Eng': {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  'Relative Name': {
    type: String,
    trim: true
  },
  'Relative Name Eng': {
    type: String,
    trim: true
  },
  Sex: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  Age: {
    type: Number
  },
  CardNo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  Address: {
    type: String,
    trim: true
  },
  'Address Eng': {
    type: String,
    trim: true
  },
  Booth: {
    type: String,
    trim: true
  },
  'Booth Eng': {
    type: String,
    trim: true
  },
  Status: {
    type: String,
    trim: true
  },
  pno: {
    type: String,
    trim: true
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isVisited: {
    type: Boolean,
    default: false
  },
  surveyDone: {
    type: Boolean,
    default: false
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey'
  },
  lastSurveyDate: {
    type: Date
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create text index for comprehensive search
voterSchema.index({
  'Voter Name Eng': 'text',
  'Voter Name': 'text',
  'Relative Name Eng': 'text',
  'Relative Name': 'text',
  Address: 'text',
  'Address Eng': 'text',
  Booth: 'text',
  'Booth Eng': 'text'
});

// Create individual indexes for better performance
voterSchema.index({ 'Voter Name Eng': 1 });
voterSchema.index({ AC: 1 });
voterSchema.index({ Part: 1 });
voterSchema.index({ CardNo: 1 });
voterSchema.index({ isPaid: 1 });
voterSchema.index({ isVisited: 1 });
voterSchema.index({ surveyDone: 1 });
voterSchema.index({ surveyId: 1 });

module.exports = mongoose.model('Voter', voterSchema);
