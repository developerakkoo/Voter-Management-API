#!/usr/bin/env node

/**
 * Script to assign all voters with completed surveys to a specific sub-admin
 * 
 * Usage:
 * node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> [options]
 * 
 * Options:
 * --dry-run: Show what would be assigned without actually assigning
 * --status: Survey status to filter (default: completed)
 * --voter-type: Voter type to filter (Voter, VoterFour, or all)
 * --batch-size: Number of voters to process in each batch (default: 100)
 * --help: Show this help message
 * 
 * Examples:
 * node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0
 * node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
 * node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --status=verified --voter-type=Voter
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Survey = require('../models/Survey');
const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');
const Voter = require('../models/Voter');
const VoterFour = require('../models/VoterFour');

// Configuration
const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SURVEY_STATUS = 'completed';
const DEFAULT_VOTER_TYPE = 'all';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    subAdminId: null,
    dryRun: false,
    status: DEFAULT_SURVEY_STATUS,
    voterType: DEFAULT_VOTER_TYPE,
    batchSize: DEFAULT_BATCH_SIZE,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--status=')) {
      options.status = arg.split('=')[1];
    } else if (arg.startsWith('--voter-type=')) {
      options.voterType = arg.split('=')[1];
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
Script to assign all voters with completed surveys to a specific sub-admin

Usage:
  node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> [options]

Arguments:
  subAdminId    The MongoDB ObjectId of the sub-admin to assign voters to

Options:
  --dry-run              Show what would be assigned without actually assigning
  --status=<status>      Survey status to filter (default: completed)
                         Options: draft, completed, submitted, verified, rejected
  --voter-type=<type>    Voter type to filter (default: all)
                         Options: Voter, VoterFour, all
  --batch-size=<size>    Number of voters to process in each batch (default: 100)
  --help, -h             Show this help message

Examples:
  # Assign all voters with completed surveys to a sub-admin
  node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0

  # Dry run to see what would be assigned
  node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run

  # Assign only verified surveys for Voter type
  node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --status=verified --voter-type=Voter

  # Process in smaller batches
  node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --batch-size=50
`);
}

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api';
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 120000,
      serverSelectionTimeoutMS: 120000,
      socketTimeoutMS: 120000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    });
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

// Get voters with completed surveys
async function getVotersWithCompletedSurveys(status, voterType) {
  try {
    console.log(`🔍 Finding voters with ${status} surveys...`);
    
    // Build survey filter
    const surveyFilter = { status };
    if (voterType !== 'all') {
      surveyFilter.voterType = voterType;
    }

    // Get all surveys matching the criteria
    const surveys = await Survey.find(surveyFilter)
      .select('voterId voterType status completedAt createdAt')
      .lean();

    console.log(`📊 Found ${surveys.length} surveys with status: ${status}`);

    // Group voters by type
    const votersByType = {
      Voter: new Set(),
      VoterFour: new Set()
    };

    surveys.forEach(survey => {
      if (survey.voterId && survey.voterType) {
        votersByType[survey.voterType].add(survey.voterId.toString());
      }
    });

    const voterCounts = {
      Voter: votersByType.Voter.size,
      VoterFour: votersByType.VoterFour.size
    };

    console.log(`👥 Unique voters found:`);
    console.log(`   - Voter: ${voterCounts.Voter}`);
    console.log(`   - VoterFour: ${voterCounts.VoterFour}`);
    console.log(`   - Total: ${voterCounts.Voter + voterCounts.VoterFour}`);

    return {
      votersByType,
      voterCounts,
      totalSurveys: surveys.length
    };
  } catch (error) {
    console.error('❌ Error getting voters with completed surveys:', error.message);
    throw error;
  }
}

// Check existing assignments
async function checkExistingAssignments(subAdminId, votersByType) {
  try {
    console.log('🔍 Checking existing assignments...');
    
    const allVoterIds = [
      ...Array.from(votersByType.Voter),
      ...Array.from(votersByType.VoterFour)
    ];

    const existingAssignments = await VoterAssignment.find({
      subAdminId,
      voterId: { $in: allVoterIds },
      isActive: true
    }).lean();

    const alreadyAssigned = {
      Voter: new Set(),
      VoterFour: new Set()
    };

    existingAssignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        alreadyAssigned.Voter.add(assignment.voterId.toString());
      } else if (assignment.voterType === 'VoterFour') {
        alreadyAssigned.VoterFour.add(assignment.voterId.toString());
      }
    });

    const newAssignments = {
      Voter: new Set(),
      VoterFour: new Set()
    };

    // Find voters that need new assignments
    votersByType.Voter.forEach(voterId => {
      if (!alreadyAssigned.Voter.has(voterId)) {
        newAssignments.Voter.add(voterId);
      }
    });

    votersByType.VoterFour.forEach(voterId => {
      if (!alreadyAssigned.VoterFour.has(voterId)) {
        newAssignments.VoterFour.add(voterId);
      }
    });

    const stats = {
      alreadyAssigned: {
        Voter: alreadyAssigned.Voter.size,
        VoterFour: alreadyAssigned.VoterFour.size,
        total: alreadyAssigned.Voter.size + alreadyAssigned.VoterFour.size
      },
      newAssignments: {
        Voter: newAssignments.Voter.size,
        VoterFour: newAssignments.VoterFour.size,
        total: newAssignments.Voter.size + newAssignments.VoterFour.size
      }
    };

    console.log('📋 Assignment status:');
    console.log(`   - Already assigned: ${stats.alreadyAssigned.total} voters`);
    console.log(`   - New assignments needed: ${stats.newAssignments.total} voters`);

    return {
      newAssignments,
      stats
    };
  } catch (error) {
    console.error('❌ Error checking existing assignments:', error.message);
    throw error;
  }
}

// Process assignments in batches
async function processAssignments(subAdminId, newAssignments, batchSize, dryRun, status) {
  try {
    const results = {
      Voter: { created: 0, errors: 0 },
      VoterFour: { created: 0, errors: 0 }
    };

    const voterTypes = ['Voter', 'VoterFour'];
    
    for (const voterType of voterTypes) {
      const voterIds = Array.from(newAssignments[voterType]);
      
      if (voterIds.length === 0) {
        console.log(`⏭️  No ${voterType} voters to assign`);
        continue;
      }

      console.log(`\n🔄 Processing ${voterIds.length} ${voterType} voters...`);
      
      // Process in batches
      for (let i = 0; i < voterIds.length; i += batchSize) {
        const batch = voterIds.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(voterIds.length / batchSize);
        
        console.log(`   📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} voters)`);

        if (dryRun) {
          console.log(`   🔍 DRY RUN: Would assign ${batch.length} ${voterType} voters`);
          results[voterType].created += batch.length;
        } else {
          try {
            // Create assignments
            const assignments = batch.map(voterId => ({
              subAdminId,
              voterId,
              voterType,
              notes: `Auto-assigned via script - voters with ${status} surveys`,
              assignedAt: new Date()
            }));

            const createdAssignments = await VoterAssignment.insertMany(assignments);
            results[voterType].created += createdAssignments.length;
            
            console.log(`   ✅ Successfully assigned ${createdAssignments.length} ${voterType} voters`);
          } catch (error) {
            console.error(`   ❌ Error assigning batch ${batchNumber}:`, error.message);
            results[voterType].errors += batch.length;
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Error processing assignments:', error.message);
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

  // Validate voter type
  if (!['Voter', 'VoterFour', 'all'].includes(options.voterType)) {
    console.error('❌ Error: Invalid voter type. Must be Voter, VoterFour, or all');
    process.exit(1);
  }

  // Validate survey status
  if (!['draft', 'completed', 'submitted', 'verified', 'rejected'].includes(options.status)) {
    console.error('❌ Error: Invalid survey status. Must be draft, completed, submitted, verified, or rejected');
    process.exit(1);
  }

  console.log('🚀 Starting assignment process...');
  console.log(`📋 Configuration:`);
  console.log(`   - Sub-admin ID: ${options.subAdminId}`);
  console.log(`   - Survey status: ${options.status}`);
  console.log(`   - Voter type: ${options.voterType}`);
  console.log(`   - Batch size: ${options.batchSize}`);
  console.log(`   - Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  try {
    // Connect to database
    await connectDB();

    // Validate sub-admin
    const subAdmin = await validateSubAdmin(options.subAdminId);
    console.log(`✅ Sub-admin validated: ${subAdmin.fullName} (${subAdmin.userId})`);

    // Get voters with completed surveys
    const { votersByType, voterCounts, totalSurveys } = await getVotersWithCompletedSurveys(
      options.status, 
      options.voterType
    );

    if (voterCounts.Voter + voterCounts.VoterFour === 0) {
      console.log('ℹ️  No voters found with the specified criteria. Exiting.');
      return;
    }

    // Check existing assignments
    const { newAssignments, stats } = await checkExistingAssignments(
      options.subAdminId, 
      votersByType
    );

    if (stats.newAssignments.total === 0) {
      console.log('ℹ️  All voters are already assigned to this sub-admin. Exiting.');
      return;
    }

    // Process assignments
    const results = await processAssignments(
      options.subAdminId,
      newAssignments,
      options.batchSize,
      options.dryRun,
      options.status
    );

    // Summary
    console.log('\n📊 Assignment Summary:');
    console.log(`   - Total surveys processed: ${totalSurveys}`);
    console.log(`   - Unique voters found: ${voterCounts.Voter + voterCounts.VoterFour}`);
    console.log(`   - Already assigned: ${stats.alreadyAssigned.total}`);
    console.log(`   - New assignments: ${stats.newAssignments.total}`);
    
    if (!options.dryRun) {
      console.log(`   - Successfully assigned:`);
      console.log(`     • Voter: ${results.Voter.created}`);
      console.log(`     • VoterFour: ${results.VoterFour.created}`);
      console.log(`     • Total: ${results.Voter.created + results.VoterFour.created}`);
      
      if (results.Voter.errors > 0 || results.VoterFour.errors > 0) {
        console.log(`   - Errors:`);
        console.log(`     • Voter: ${results.Voter.errors}`);
        console.log(`     • VoterFour: ${results.VoterFour.errors}`);
      }
    } else {
      console.log(`   - Would assign:`);
      console.log(`     • Voter: ${results.Voter.created}`);
      console.log(`     • VoterFour: ${results.VoterFour.created}`);
      console.log(`     • Total: ${results.Voter.created + results.VoterFour.created}`);
    }

    console.log('\n✅ Assignment process completed successfully!');

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
  getVotersWithCompletedSurveys,
  checkExistingAssignments,
  processAssignments
};
