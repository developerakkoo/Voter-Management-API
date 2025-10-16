#!/usr/bin/env node

/**
 * Quick script to assign all voters with completed surveys to a specific sub-admin
 * 
 * Usage:
 * node scripts/quick-assign-completed-surveys.js <subAdminId>
 * 
 * This script will:
 * 1. Find all voters who have completed surveys
 * 2. Check if they're already assigned to the sub-admin
 * 3. Assign only the unassigned voters
 * 4. Provide a summary of the operation
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Survey = require('../models/Survey');
const VoterAssignment = require('../models/VoterAssignment');
const SubAdmin = require('../models/SubAdmin');

async function main() {
  const subAdminId = process.argv[2];
  
  if (!subAdminId) {
    console.error('❌ Error: Sub-admin ID is required');
    console.log('Usage: node scripts/quick-assign-completed-surveys.js <subAdminId>');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting quick assignment process...');
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

    // Get all completed surveys
    console.log('🔍 Finding voters with completed surveys...');
    const completedSurveys = await Survey.find({ status: 'completed' })
      .select('voterId voterType')
      .lean();

    console.log(`📊 Found ${completedSurveys.length} completed surveys`);

    // Get unique voters
    const votersByType = {
      Voter: new Set(),
      VoterFour: new Set()
    };

    completedSurveys.forEach(survey => {
      if (survey.voterId && survey.voterType) {
        votersByType[survey.voterType].add(survey.voterId.toString());
      }
    });

    const totalVoters = votersByType.Voter.size + votersByType.VoterFour.size;
    console.log(`👥 Found ${totalVoters} unique voters with completed surveys`);
    console.log(`   - Voter: ${votersByType.Voter.size}`);
    console.log(`   - VoterFour: ${votersByType.VoterFour.size}`);

    if (totalVoters === 0) {
      console.log('ℹ️  No voters found with completed surveys. Exiting.');
      return;
    }

    // Check existing assignments
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

    const alreadyAssigned = new Set();
    existingAssignments.forEach(assignment => {
      alreadyAssigned.add(assignment.voterId.toString());
    });

    console.log(`📋 Already assigned: ${alreadyAssigned.size} voters`);

    // Find voters that need assignment
    const votersToAssign = {
      Voter: [],
      VoterFour: []
    };

    votersByType.Voter.forEach(voterId => {
      if (!alreadyAssigned.has(voterId)) {
        votersToAssign.Voter.push(voterId);
      }
    });

    votersByType.VoterFour.forEach(voterId => {
      if (!alreadyAssigned.has(voterId)) {
        votersToAssign.VoterFour.push(voterId);
      }
    });

    const totalToAssign = votersToAssign.Voter.length + votersToAssign.VoterFour.length;
    console.log(`🆕 Voters to assign: ${totalToAssign}`);
    console.log(`   - Voter: ${votersToAssign.Voter.length}`);
    console.log(`   - VoterFour: ${votersToAssign.VoterFour.length}`);

    if (totalToAssign === 0) {
      console.log('ℹ️  All voters are already assigned to this sub-admin. Exiting.');
      return;
    }

    // Create assignments
    console.log('🔄 Creating assignments...');
    const assignments = [];

    votersToAssign.Voter.forEach(voterId => {
      assignments.push({
        subAdminId,
        voterId,
        voterType: 'Voter',
        notes: 'Auto-assigned via script - voters with completed surveys',
        assignedAt: new Date()
      });
    });

    votersToAssign.VoterFour.forEach(voterId => {
      assignments.push({
        subAdminId,
        voterId,
        voterType: 'VoterFour',
        notes: 'Auto-assigned via script - voters with completed surveys',
        assignedAt: new Date()
      });
    });

    const result = await VoterAssignment.insertMany(assignments);
    console.log(`✅ Successfully assigned ${result.length} voters`);

    // Summary
    console.log('\n📊 Assignment Summary:');
    console.log(`   - Sub-admin: ${subAdmin.fullName} (${subAdmin.userId})`);
    console.log(`   - Total completed surveys: ${completedSurveys.length}`);
    console.log(`   - Unique voters with surveys: ${totalVoters}`);
    console.log(`   - Already assigned: ${alreadyAssigned.size}`);
    console.log(`   - Newly assigned: ${result.length}`);
    console.log(`   - Assignment breakdown:`);
    console.log(`     • Voter: ${votersToAssign.Voter.length}`);
    console.log(`     • VoterFour: ${votersToAssign.VoterFour.length}`);

    console.log('\n✅ Assignment process completed successfully!');

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
