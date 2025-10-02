const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  link: {
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty URL
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL must be a valid HTTP/HTTPS link'
      }
    },
    text: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['all', 'admins', 'subadmins', 'voters'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for better performance
alertSchema.index({ title: 'text', description: 'text' });
alertSchema.index({ isActive: 1 });
alertSchema.index({ isPublished: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ category: 1 });
alertSchema.index({ targetAudience: 1 });
alertSchema.index({ createdBy: 1 });
alertSchema.index({ publishedAt: 1 });
alertSchema.index({ expiresAt: 1 });
alertSchema.index({ tags: 1 });

// Virtual for checking if alert is expired
alertSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for getting image count
alertSchema.virtual('imageCount').get(function() {
  return this.images.length;
});

// Method to add image
alertSchema.methods.addImage = function(imageData) {
  this.images.push(imageData);
  return this.save();
};

// Method to remove image
alertSchema.methods.removeImage = function(imageId) {
  this.images = this.images.filter(img => img._id.toString() !== imageId.toString());
  return this.save();
};

// Method to publish alert
alertSchema.methods.publish = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Method to unpublish alert
alertSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.publishedAt = undefined;
  return this.save();
};

// Method to increment view count
alertSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get published alerts
alertSchema.statics.getPublishedAlerts = function(filters = {}) {
  const query = { isPublished: true, isActive: true };
  
  // Add expiration filter
  query.$or = [
    { expiresAt: { $exists: false } },
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ];
  
  return this.find({ ...query, ...filters }).sort({ publishedAt: -1 });
};

// Static method to get alerts by target audience
alertSchema.statics.getAlertsByAudience = function(audience, filters = {}) {
  const query = {
    $or: [
      { targetAudience: 'all' },
      { targetAudience: audience }
    ],
    isPublished: true,
    isActive: true
  };
  
  // Add expiration filter
  query.$and = [
    {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }
  ];
  
  return this.find({ ...query, ...filters }).sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Alert', alertSchema);
