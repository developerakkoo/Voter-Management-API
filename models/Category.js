const mongoose = require('mongoose');

// Schema for individual data entries within a category
const dataEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  info: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Main Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  dataEntries: [dataEntrySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Create indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ tags: 1 });
categorySchema.index({ createdBy: 1 });
categorySchema.index({ 'dataEntries.isActive': 1 });
categorySchema.index({ 'dataEntries.createdAt': -1 });

// Virtual for getting active data entries count
categorySchema.virtual('activeDataEntriesCount').get(function() {
  return this.dataEntries.filter(entry => entry.isActive).length;
});

// Virtual for getting total data entries count
categorySchema.virtual('totalDataEntriesCount').get(function() {
  return this.dataEntries.length;
});

// Method to add data entry to category
categorySchema.methods.addDataEntry = function(dataEntryData) {
  this.dataEntries.push(dataEntryData);
  return this.save();
};

// Method to update data entry
categorySchema.methods.updateDataEntry = function(entryId, updateData) {
  const entry = this.dataEntries.id(entryId);
  if (!entry) {
    throw new Error('Data entry not found');
  }
  
  Object.assign(entry, updateData);
  entry.lastUpdatedBy = updateData.lastUpdatedBy;
  return this.save();
};

// Method to remove data entry
categorySchema.methods.removeDataEntry = function(entryId) {
  this.dataEntries = this.dataEntries.filter(entry => entry._id.toString() !== entryId.toString());
  return this.save();
};

// Method to reorder data entries
categorySchema.methods.reorderDataEntries = function(entryIds) {
  const entries = this.dataEntries;
  const reorderedEntries = [];
  
  entryIds.forEach((id, index) => {
    const entry = entries.id(id);
    if (entry) {
      entry.order = index;
      reorderedEntries.push(entry);
    }
  });
  
  // Add remaining entries that weren't in the reorder list
  entries.forEach(entry => {
    if (!entryIds.includes(entry._id.toString())) {
      reorderedEntries.push(entry);
    }
  });
  
  this.dataEntries = reorderedEntries;
  return this.save();
};

// Method to get active data entries
categorySchema.methods.getActiveDataEntries = function() {
  return this.dataEntries.filter(entry => entry.isActive);
};

// Method to get data entries by search
categorySchema.methods.searchDataEntries = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.dataEntries.filter(entry => 
    entry.isActive && (
      regex.test(entry.title) || 
      regex.test(entry.description) || 
      regex.test(entry.info)
    )
  );
};

// Static method to get categories with active data entries
categorySchema.statics.getActiveCategories = function() {
  return this.find({ 
    isActive: true,
    'dataEntries.0': { $exists: true } // Has at least one data entry
  }).sort({ order: 1, name: 1 });
};

// Static method to search categories and data entries
categorySchema.statics.searchCategories = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    isActive: true,
    $or: [
      { name: regex },
      { description: regex },
      { 'dataEntries.title': regex },
      { 'dataEntries.description': regex },
      { 'dataEntries.info': regex }
    ]
  }).sort({ order: 1, name: 1 });
};

// Static method to get category statistics
categorySchema.statics.getCategoryStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalDataEntries: { $sum: { $size: '$dataEntries' } },
        activeDataEntries: {
          $sum: {
            $size: {
              $filter: {
                input: '$dataEntries',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCategories: 0,
    activeCategories: 0,
    totalDataEntries: 0,
    activeDataEntries: 0
  };
};

module.exports = mongoose.model('Category', categorySchema);
