const mongoose = require('mongoose');

const voterAssignmentSchema = new mongoose.Schema({
  subAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubAdmin',
    required: true,
    index: true
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  voterType: {
    type: String,
    enum: ['Voter', 'VoterFour'],
    required: true,
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
voterAssignmentSchema.index({ subAdminId: 1, voterId: 1, voterType: 1 }, { unique: true });
voterAssignmentSchema.index({ subAdminId: 1, isActive: 1 });
voterAssignmentSchema.index({ voterId: 1, voterType: 1, isActive: 1 });
voterAssignmentSchema.index({ assignedBy: 1, assignedAt: -1 });

// Static method to get assigned voters for a sub admin
voterAssignmentSchema.statics.getAssignedVoters = async function(subAdminId, voterType = null) {
  const query = { subAdminId, isActive: true };
  if (voterType) {
    query.voterType = voterType;
  }
  
  return this.find(query)
    .populate('voterId')
    .sort({ assignedAt: -1 });
};

// Static method to check if voter is assigned to sub admin
voterAssignmentSchema.statics.isVoterAssigned = async function(subAdminId, voterId, voterType) {
  const assignment = await this.findOne({
    subAdminId,
    voterId,
    voterType,
    isActive: true
  });
  return !!assignment;
};

// Static method to get assignment statistics
voterAssignmentSchema.statics.getAssignmentStats = async function(subAdminId = null) {
  const matchStage = subAdminId ? { subAdminId: new mongoose.Types.ObjectId(subAdminId) } : {};
  
  return this.aggregate([
    { $match: { ...matchStage, isActive: true } },
    {
      $group: {
        _id: {
          subAdminId: '$subAdminId',
          voterType: '$voterType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.subAdminId',
        totalAssignments: { $sum: '$count' },
        voterTypes: {
          $push: {
            type: '$_id.voterType',
            count: '$count'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('VoterAssignment', voterAssignmentSchema);
