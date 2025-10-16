#!/usr/bin/env node

/**
 * Script to unassign all voters from a specific sub-admin
 * 
 * Usage:
 * node scripts/unassign-all-voters-from-subadmin.js <subAdminId> [options]
 * 
 * Options:
 * --dry-run: Show what would be unassigned without actually unassigning
 * --batch-size: Number of assignments to process in each batch (default: 100)
 * --help: Show this help message
 * 
 * Examples:
 * node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0
 * node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
 * node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --batch-size=50
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// Configuration
const DEFAULT_BATCH_SIZE = 100;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    subAdminId: null,
    dryRun: false,
    batchSize: DEFAULT_BATCH_SIZE,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1]);
    } else if (!options.subAdminId && !arg.startsWith('--')) {
      options.subAdminId = arg;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
Script to unassign all voters from a specific sub-admin

Usage:
  node scripts/unassign-all-voters-from-subadmin.js <subAdminId> [options]

Arguments:
  subAdminId    The MongoDB ObjectId of the sub-admin to unassign voters from

Options:
  --dry-run              Show what would be unassigned without actually unassigning
  --batch-size=<size>   Number of assignments to process in each batch (default: 100)
  --help, -h             Show this help message

Examples:
  # Unassign all voters from a sub-admin
  node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0

  # Dry run to see what would be unassigned
  node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run

  # Process in smaller batches
  node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --batch-size=50
`);
}

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Validate sub-admin exists
async function validateSubAdmin(subAdminId) {
  try {
    // Convert string to ObjectId if needed
    const objectId = mongoose.Types.ObjectId.isValid(subAdminId) 
      ? new mongoose.Types.ObjectId(subAdminId) 
      : subAdminId;
    
    const subAdmin = await SubAdmin.findById(objectId);
    if (!subAdmin) {
      throw new Error(`Sub-admin with ID ${subAdminId} not found`);
    }
    return subAdmin;
  } catch (error) {
    console.error('❌ Error validating sub-admin:', error.message);
    process.exit(1);
  }
}

// Get current assignments for the sub-admin
async function getCurrentAssignments(subAdminId) {
  try {
    console.log('🔍 Finding current assignments...');
    
    const assignments = await VoterAssignment.find({
      subAdminId,
      isActive: true
    }).lean();

    console.log(`📊 Found ${assignments.length} active assignments`);

    // Group assignments by voter type
    const assignmentsByType = {
      Voter: [],
      VoterFour: []
    };

    assignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        assignmentsByType.Voter.push(assignment);
      } else if (assignment.voterType === 'VoterFour') {
        assignmentsByType.VoterFour.push(assignment);
      }
    });

    const stats = {
      total: assignments.length,
      Voter: assignmentsByType.Voter.length,
      VoterFour: assignmentsByType.VoterFour.length
    };

    console.log(`👥 Assignment breakdown:`);
    console.log(`   - Voter: ${stats.Voter}`);
    console.log(`   - VoterFour: ${stats.VoterFour}`);
    console.log(`   - Total: ${stats.total}`);

    return {
      assignments,
      assignmentsByType,
      stats
    };
  } catch (error) {
    console.error('❌ Error getting current assignments:', error.message);
    throw error;
  }
}

// Get voter details for assignments
async function getVoterDetails(assignments) {
  try {
    console.log('🔍 Getting voter details...');
    
    const voterDetails = {};
    
    // Group voter IDs by type
    const voterIdsByType = {
      Voter: [],
      VoterFour: []
    };

    assignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        voterIdsByType.Voter.push(assignment.voterId);
      } else if (assignment.voterType === 'VoterFour') {
        voterIdsByType.VoterFour.push(assignment.voterId);
      }
    });

    // Fetch voter details
    const [voters, votersFour] = await Promise.all([
      Voter.find({ _id: { $in: voterIdsByType.Voter } })
        .select('Voter Name Eng Voter Name CardNo CodeNo AC Part Booth')
        .lean(),
      VoterFour.find({ _id: { $in: voterIdsByType.VoterFour } })
        .select('Voter Name Eng Voter Name CardNo CodeNo AC Part Booth no')
        .lean()
    ]);

    // Create lookup maps
    voters.forEach(voter => {
      voterDetails[voter._id.toString()] = {
        ...voter,
        voterType: 'Voter'
      };
    });

    votersFour.forEach(voter => {
      voterDetails[voter._id.toString()] = {
        ...voter,
        voterType: 'VoterFour'
      };
    });

    console.log(`📋 Retrieved details for ${Object.keys(voterDetails).length} voters`);

    return voterDetails;
  } catch (error) {
    console.error('❌ Error getting voter details:', error.message);
    throw error;
  }
}

// Process unassignments in batches
async function processUnassignments(subAdminId, assignments, batchSize, dryRun) {
  try {
    const results = {
      totalProcessed: 0,
      errors: 0,
      batches: 0
    };

    if (assignments.length === 0) {
      console.log('ℹ️  No assignments to process');
      return results;
    }

    console.log(`\n🔄 Processing ${assignments.length} assignments...`);
    
    // Process in batches
    for (let i = 0; i < assignments.length; i += batchSize) {
      const batch = assignments.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(assignments.length / batchSize);
      
      console.log(`   📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} assignments)`);

      if (dryRun) {
        console.log(`   🔍 DRY RUN: Would unassign ${batch.length} voters`);
        results.totalProcessed += batch.length;
      } else {
        try {
          // Get assignment IDs for this batch
          const assignmentIds = batch.map(assignment => assignment._id);
          
          // Update assignments to inactive
          const updateResult = await VoterAssignment.updateMany(
            { _id: { $in: assignmentIds } },
            { 
              isActive: false,
              unassignedAt: new Date()
            }
          );
          
          results.totalProcessed += updateResult.modifiedCount;
          console.log(`   ✅ Successfully unassigned ${updateResult.modifiedCount} voters`);
        } catch (error) {
          console.error(`   ❌ Error processing batch ${batchNumber}:`, error.message);
          results.errors += batch.length;
        }
      }
      
      results.batches++;
    }

    return results;
  } catch (error) {
    console.error('❌ Error processing unassignments:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (!options.subAdminId) {
    console.error('❌ Error: Sub-admin ID is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  console.log('🚀 Starting unassignment process...');
  console.log(`📋 Configuration:`);
  console.log(`   - Sub-admin ID: ${options.subAdminId}`);
  console.log(`   - Batch size: ${options.batchSize}`);
  console.log(`   - Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  try {
    // Connect to database
    await connectDB();

    // Validate sub-admin
    const subAdmin = await validateSubAdmin(options.subAdminId);
    console.log(`✅ Sub-admin validated: ${subAdmin.fullName} (${subAdmin.userId})`);

    // Get current assignments
    const { assignments, assignmentsByType, stats } = await getCurrentAssignments(options.subAdminId);

    if (stats.total === 0) {
      console.log('ℹ️  No active assignments found for this sub-admin. Exiting.');
      return;
    }

    // Get voter details (optional, for better reporting)
    const voterDetails = await getVoterDetails(assignments);

    // Process unassignments
    const results = await processUnassignments(
      options.subAdminId,
      assignments,
      options.batchSize,
      options.dryRun
    );

    // Summary
    console.log('\n📊 Unassignment Summary:');
    console.log(`   - Sub-admin: ${subAdmin.fullName} (${subAdmin.userId})`);
    console.log(`   - Total assignments found: ${stats.total}`);
    console.log(`   - Assignment breakdown:`);
    console.log(`     • Voter: ${stats.Voter}`);
    console.log(`     • VoterFour: ${stats.VoterFour}`);
    
    if (!options.dryRun) {
      console.log(`   - Successfully unassigned: ${results.totalProcessed}`);
      console.log(`   - Errors: ${results.errors}`);
      console.log(`   - Batches processed: ${results.batches}`);
      
      if (results.errors > 0) {
        console.log(`   ⚠️  ${results.errors} assignments could not be processed`);
      }
    } else {
      console.log(`   - Would unassign: ${results.totalProcessed}`);
      console.log(`   - Batches that would be processed: ${results.batches}`);
    }

    console.log('\n✅ Unassignment process completed successfully!');
    console.log('ℹ️  All unassigned voters are now available for reassignment to other sub-admins.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  showHelp,
  connectDB,
  validateSubAdmin,
  getCurrentAssignments,
  getVoterDetails,
  processUnassignments
};
