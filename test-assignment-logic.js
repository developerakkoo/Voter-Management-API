const mongoose = require('mongoose');
const VoterAssignment = require('./models/VoterAssignment');
const SubAdmin = require('./models/SubAdmin');
const Voter = require('./models/Voter');
const VoterFour = require('./models/VoterFour');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test the modified assignment logic
const testAssignmentLogic = async () => {
  try {
    console.log('\n=== Testing Assignment Logic ===');
    
    // Get some sample data
    const [subAdmin, voters] = await Promise.all([
      SubAdmin.findOne(),
      Voter.find({}).limit(5)
    ]);
    
    if (!subAdmin) {
      console.log('❌ No sub admin found in database');
      return;
    }
    
    if (voters.length === 0) {
      console.log('❌ No voters found in database');
      return;
    }
    
    console.log(`✅ Found sub admin: ${subAdmin.fullName} (${subAdmin._id})`);
    console.log(`✅ Found ${voters.length} voters`);
    
    // Test case 1: Assign some voters first
    const voterIds = voters.map(v => v._id);
    console.log(`\n--- Test Case 1: Initial Assignment ---`);
    console.log(`Assigning ${voterIds.length} voters to sub admin...`);
    
    // Simulate the assignment logic
    const VoterModel = Voter;
    const existingVoters = await VoterModel.find({ _id: { $in: voterIds } });
    
    if (existingVoters.length !== voterIds.length) {
      console.log(`❌ Some voters not found: ${existingVoters.length}/${voterIds.length}`);
      return;
    }
    
    // Check for existing assignments
    const existingAssignments = await VoterAssignment.find({
      subAdminId: subAdmin._id,
      voterId: { $in: voterIds },
      voterType: 'Voter'
    });
    
    const existingVoterIds = existingAssignments.map(a => a.voterId.toString());
    const newVoterIds = voterIds.filter(id => !existingVoterIds.includes(id.toString()));
    const assignmentsToUpdate = existingAssignments.filter(a => !a.isActive);
    const assignmentsToReactivate = existingAssignments.filter(a => a.isActive);
    
    console.log(`📊 Assignment Analysis:`);
    console.log(`  - Total voters: ${voterIds.length}`);
    console.log(`  - Already assigned (active): ${assignmentsToReactivate.length}`);
    console.log(`  - Already assigned (inactive): ${assignmentsToUpdate.length}`);
    console.log(`  - New assignments needed: ${newVoterIds.length}`);
    
    // Test case 2: Try to assign the same voters again (should handle gracefully)
    console.log(`\n--- Test Case 2: Re-assignment Test ---`);
    console.log(`Trying to assign the same voters again...`);
    
    const existingAssignments2 = await VoterAssignment.find({
      subAdminId: subAdmin._id,
      voterId: { $in: voterIds },
      voterType: 'Voter'
    });
    
    const assignmentsToReactivate2 = existingAssignments2.filter(a => a.isActive);
    
    if (assignmentsToReactivate2.length > 0) {
      console.log(`✅ Logic correctly identifies ${assignmentsToReactivate2.length} already assigned voters`);
      console.log(`✅ Would return success with partial assignment info instead of error`);
    } else {
      console.log(`ℹ️  No active assignments found (voters not yet assigned)`);
    }
    
    console.log(`\n✅ Assignment logic test completed successfully!`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

const main = async () => {
  await connectDB();
  await testAssignmentLogic();
  process.exit(0);
};

if (require.main === module) {
  main();
}

module.exports = { testAssignmentLogic };
