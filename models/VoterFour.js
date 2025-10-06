const mongoose = require('mongoose');

const voterFourSchema = new mongoose.Schema({
  // Exact column names from 1st.xlsx, 2nd.xlsx, 3rd.xlsx files
  AC: {
    type: String,
    trim: true
  },
  'Booth no': {
    type: String,
    trim: true
  },
  'Sr No': {
    type: String,
    trim: true
  },
  'Sr no': {
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
  ' Relative Name Eng': {
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
  CodeNo: {
    type: String,
    trim: true
  },
  Address: {
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
  pno: {
    type: String,
    trim: true
  },
  
  // Source file information
  sourceFile: {
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

// in your VoterFour schema file
function tokenizeName(name="") {
  return name.replace(/[^A-Za-z\s]+/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).map(s=>s.toLowerCase());
}
function prefixesForToken(t){ const out=[]; for(let L=2; L<=Math.min(5,t.length); L++) out.push(t.slice(0,L)); return out; }
function buildPrefixes(name){ const set=new Set(); tokenizeName(name).forEach(t=>prefixesForToken(t).forEach(p=>set.add(p))); return [...set]; }
function initialsOf(name){ return tokenizeName(name).map(t=>t[0]?.toUpperCase()).filter(Boolean).join(""); }

voterFourSchema.pre("save", function(next){
  const name = this.get("Voter Name Eng") || this.voterNameEng || "";
  const initials = initialsOf(name);
  this.set("initials", initials);
  this.set("initialsSpaced", initials.split("").join(" "));
  this.set("initialsDotted", initials.split("").join("."));
  this.set("namePrefixes", buildPrefixes(name));
  next();
});


// Create text index for comprehensive search
voterFourSchema.index({
  'Voter Name Eng': 'text',
  'Voter Name': 'text',
  'Relative Name Eng': 'text',
  ' Relative Name Eng': 'text',
  'Relative Name': 'text',
  Address: 'text',
  Booth: 'text',
  'Booth Eng': 'text'
});

// Create individual indexes for better performance
voterFourSchema.index({ 'Voter Name Eng': 1 });
voterFourSchema.index({ AC: 1 });
voterFourSchema.index({ 'Booth no': 1 });
voterFourSchema.index({ CardNo: 1 });
voterFourSchema.index({ CodeNo: 1 });
voterFourSchema.index({ sourceFile: 1 });
voterFourSchema.index({ isPaid: 1 });
voterFourSchema.index({ isVisited: 1 });
voterFourSchema.index({ surveyDone: 1 });
voterFourSchema.index({ surveyId: 1 });

module.exports = mongoose.model('VoterFour', voterFourSchema);
