#!/usr/bin/env node

/**
 * Quick script to unassign all voters from a specific sub-admin
 * 
 * Usage:
 * node scripts/quick-unassign-all-voters.js <subAdminId>
 * 
 * This script will:
 * 1. Find all active assignments for the sub-admin
 * 2. Unassign all voters from the sub-admin
 * 3. Provide a summary of the operation
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');

async function main() {
  const subAdminId = process.argv[2];
  
  if (!subAdminId) {
    console.error('❌ Error: Sub-admin ID is required');
    console.log('Usage: node scripts/quick-unassign-all-voters.js <subAdminId>');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting quick unassignment process...');
    console.log(`📋 Sub-admin ID: ${subAdminId}`);
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Validate sub-admin
    const objectId = mongoose.Types.ObjectId.isValid(subAdminId) 
      ? new mongoose.Types.ObjectId(subAdminId) 
      : subAdminId;
    
    const subAdmin = await SubAdmin.findById(objectId);
    if (!subAdmin) {
      throw new Error(`Sub-admin with ID ${subAdminId} not found`);
    }
    console.log(`✅ Sub-admin validated: ${subAdmin.fullName}`);

    // Get current assignments
    console.log('🔍 Finding current assignments...');
    const assignments = await VoterAssignment.find({
      subAdminId,
      isActive: true
    }).lean();

    console.log(`📊 Found ${assignments.length} active assignments`);

    if (assignments.length === 0) {
      console.log('ℹ️  No active assignments found for this sub-admin. Exiting.');
      return;
    }

    // Group by voter type for reporting
    const voterTypeCounts = {
      Voter: 0,
      VoterFour: 0
    };

    assignments.forEach(assignment => {
      if (assignment.voterType === 'Voter') {
        voterTypeCounts.Voter++;
      } else if (assignment.voterType === 'VoterFour') {
        voterTypeCounts.VoterFour++;
      }
    });

    console.log(`👥 Assignment breakdown:`);
    console.log(`   - Voter: ${voterTypeCounts.Voter}`);
    console.log(`   - VoterFour: ${voterTypeCounts.VoterFour}`);
    console.log(`   - Total: ${assignments.length}`);

    // Unassign all voters
    console.log('🔄 Unassigning all voters...');
    const result = await VoterAssignment.updateMany(
      { subAdminId, isActive: true },
      { 
        isActive: false,
        unassignedAt: new Date()
      }
    );

    console.log(`✅ Successfully unassigned ${result.modifiedCount} voters`);

    // Summary
    console.log('\n📊 Unassignment Summary:');
    console.log(`   - Sub-admin: ${subAdmin.fullName} (${subAdmin.userId})`);
    console.log(`   - Total assignments found: ${assignments.length}`);
    console.log(`   - Successfully unassigned: ${result.modifiedCount}`);
    console.log(`   - Assignment breakdown:`);
    console.log(`     • Voter: ${voterTypeCounts.Voter}`);
    console.log(`     • VoterFour: ${voterTypeCounts.VoterFour}`);

    console.log('\n✅ Unassignment process completed successfully!');
    console.log('ℹ️  All unassigned voters are now available for reassignment to other sub-admins.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main();
}
