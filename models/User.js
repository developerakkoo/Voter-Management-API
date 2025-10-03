const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'User ID must be at least 3 characters long'],
    maxlength: [50, 'User ID cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [100, 'Password cannot exceed 100 characters']
  },
  pno: {
    type: String,
    required: [true, 'PNO is required'],
    enum: ['3', '4'],
    message: 'PNO must be either 3 or 4'
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ userId: 1 });
userSchema.index({ pno: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get public profile (without password)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by userId
userSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId.toLowerCase() });
};

// Static method to find users by PNO
userSchema.statics.findByPno = function(pno) {
  return this.find({ pno: pno, isActive: true });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } },
          pno3Users: { $sum: { $cond: [{ $eq: ['$pno', '3'] }, 1, 0] } },
          pno4Users: { $sum: { $cond: [{ $eq: ['$pno', '4'] }, 1, 0] } }
        }
      }
    ]);
    
    return stats.length > 0 ? stats[0] : {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      pno3Users: 0,
      pno4Users: 0
    };
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
