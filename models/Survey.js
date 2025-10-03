const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  // Voter reference (can be from Voter or VoterFour collection)
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Voter ID is required'],
    refPath: 'voterType'
  },
  voterType: {
    type: String,
    required: [true, 'Voter type is required'],
    enum: ['Voter', 'VoterFour'],
    default: 'Voter'
  },
  
  // Surveyor information
  surveyorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Surveyor ID is required'],
    ref: 'User'
  },
  
  // Location coordinates
  location: {
    latitude: {
      type: Number,
     
    },
    longitude: {
      type: Number,
    
    },

    accuracy: {
      type: Number,
      
    }
  },
  
  // Voter phone number
  voterPhoneNumber: {
    type: String,
    required: [true, 'Voter phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  
  // Survey status
  status: {
    type: String,
    enum: ['draft', 'completed', 'submitted', 'verified', 'rejected'],
    default: 'completed'
  },
  
  // Survey data
  surveyData: {
    type: Object,
    default: {}
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Survey completion details
  completedAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Survey metadata
  metadata: {
    type: Object,
    default: {}
  },
  
  // Survey members (embedded documents)
  members: [{
    name: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      min: [0, 'Age must be positive'],
      max: [150, 'Age must be realistic']
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    relationship: {
      type: String,
      trim: true
    },
    isVoter: {
      type: Boolean,
      default: false
    },
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'voterType'
    },
    voterType: {
      type: String,
      enum: ['Voter', 'VoterFour']
    }
  }],
  
  // Survey quality metrics
  quality: {
    score: {
      type: Number,
      min: [0, 'Quality score must be between 0 and 100'],
      max: [100, 'Quality score must be between 0 and 100']
    },
    issues: [{
      type: String,
      trim: true
    }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    reviewedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
surveySchema.index({ voterId: 1, voterType: 1 });
surveySchema.index({ surveyorId: 1 });
surveySchema.index({ status: 1 });
surveySchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
surveySchema.index({ voterPhoneNumber: 1 });
surveySchema.index({ completedAt: 1 });
surveySchema.index({ createdAt: 1 });

// Compound indexes
surveySchema.index({ surveyorId: 1, status: 1 });
surveySchema.index({ voterType: 1, status: 1 });
surveySchema.index({ createdAt: -1, status: 1 });

// Virtual for survey duration
surveySchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.round((this.completedAt - this.createdAt) / 1000 / 60); // Duration in minutes
  }
  return null;
});

// Method to mark survey as completed
surveySchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to submit survey
surveySchema.methods.submitSurvey = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

// Method to verify survey
surveySchema.methods.verifySurvey = function(adminId) {
  this.status = 'verified';
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  return this.save();
};

// Method to reject survey
surveySchema.methods.rejectSurvey = function(adminId, reason) {
  this.status = 'rejected';
  this.verifiedBy = adminId;
  this.notes = reason;
  return this.save();
};

// Static method to get survey statistics
surveySchema.statics.getSurveyStats = function(filters = {}) {
  const matchStage = {};
  
  if (filters.surveyorId) matchStage.surveyorId = new mongoose.Types.ObjectId(filters.surveyorId);
  if (filters.status) matchStage.status = filters.status;
  if (filters.voterType) matchStage.voterType = filters.voterType;
  if (filters.dateFrom || filters.dateTo) {
    matchStage.createdAt = {};
    if (filters.dateFrom) matchStage.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) matchStage.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSurveys: { $sum: 1 },
        completedSurveys: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        submittedSurveys: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
        verifiedSurveys: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
        rejectedSurveys: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        draftSurveys: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        totalMembers: { $sum: { $size: '$members' } },
        avgQualityScore: { $avg: '$quality.score' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

// Pre-save middleware to update voter's surveyDone status
surveySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    if (this.status === 'completed' || this.status === 'submitted' || this.status === 'verified') {
      try {
        // Set completedAt timestamp if not already set
        if (this.status === 'completed' && !this.completedAt) {
          this.completedAt = new Date();
        }
        
        // Update the voter's surveyDone status
        const Voter = mongoose.model('Voter');
        const VoterFour = mongoose.model('VoterFour');
        
        if (this.voterType === 'Voter') {
          await Voter.findByIdAndUpdate(this.voterId, {
            surveyDone: true,
            surveyId: this._id,
            lastSurveyDate: new Date()
          });
        } else if (this.voterType === 'VoterFour') {
          await VoterFour.findByIdAndUpdate(this.voterId, {
            surveyDone: true,
            surveyId: this._id,
            lastSurveyDate: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating voter survey status:', error);
      }
    }
  }
  next();
});

// Pre-remove middleware to update voter's surveyDone status
surveySchema.pre('remove', async function(next) {
  try {
    const Voter = mongoose.model('Voter');
    const VoterFour = mongoose.model('VoterFour');
    
    if (this.voterType === 'Voter') {
      await Voter.findByIdAndUpdate(this.voterId, {
        surveyDone: false,
        surveyId: null,
        lastSurveyDate: null
      });
    } else if (this.voterType === 'VoterFour') {
      await VoterFour.findByIdAndUpdate(this.voterId, {
        surveyDone: false,
        surveyId: null,
        lastSurveyDate: null
      });
    }
  } catch (error) {
    console.error('Error updating voter survey status on delete:', error);
  }
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
