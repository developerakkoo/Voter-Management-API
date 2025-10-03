const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subAdminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: [/^[a-zA-Z0-9_]+$/, 'UserID can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 100
  },
  locationName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  locationImage: {
    filename: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    path: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    },
    mimetype: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date
    }
  },
  assignedVoters: [{
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    voterType: {
      type: String,
      enum: ['Voter', 'VoterFour'],
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
subAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt field before saving
subAdminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
subAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
subAdminSchema.methods.getPublicProfile = function() {
  const subAdminObject = this.toObject();
  delete subAdminObject.password;
  return subAdminObject;
};

// Method to get assigned voters count
subAdminSchema.methods.getAssignedVotersCount = function() {
  return this.assignedVoters.length;
};

// Method to check if voter is assigned to this sub admin
subAdminSchema.methods.isVoterAssigned = function(voterId, voterType) {
  return this.assignedVoters.some(assignment => 
    assignment.voterId.toString() === voterId.toString() && 
    assignment.voterType === voterType
  );
};

// Create indexes
subAdminSchema.index({ userId: 1 });
subAdminSchema.index({ isActive: 1 });
subAdminSchema.index({ locationName: 1 });
subAdminSchema.index({ 'assignedVoters.voterId': 1 });
subAdminSchema.index({ 'assignedVoters.voterType': 1 });

module.exports = mongoose.model('SubAdmin', subAdminSchema);
