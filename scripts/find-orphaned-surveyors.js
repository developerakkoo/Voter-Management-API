const mongoose = require('mongoose');
const Survey = require('../models/Survey');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function findOrphanedSurveyors() {
  try {
    console.log('🔍 Finding orphaned surveyor references...\n');

    // Get all unique surveyor IDs from surveys
    const surveyorIds = await Survey.distinct('surveyorId');
    console.log(`📊 Found ${surveyorIds.length} unique surveyor IDs in surveys`);

    // Get all user IDs
    const userIds = await User.distinct('_id');
    console.log(`👥 Found ${userIds.length} users in User collection`);

    // Find orphaned surveyor IDs (exist in surveys but not in users)
    const orphanedIds = surveyorIds.filter(surveyorId => 
      !userIds.some(userId => userId.toString() === surveyorId.toString())
    );

    console.log(`\n⚠️  Found ${orphanedIds.length} orphaned surveyor references:`);
    
    if (orphanedIds.length > 0) {
      console.log('\n📋 Orphaned Surveyor IDs:');
      orphanedIds.forEach((id, index) => {
        console.log(`${index + 1}. ${id}`);
      });

      // Get survey counts for orphaned surveyors
      console.log('\n📈 Survey counts for orphaned surveyors:');
      for (const orphanedId of orphanedIds) {
        const surveyCount = await Survey.countDocuments({ surveyorId: orphanedId });
        console.log(`   ${orphanedId}: ${surveyCount} surveys`);
      }

      // Get total surveys for orphaned surveyors
      const totalOrphanedSurveys = await Survey.countDocuments({
        surveyorId: { $in: orphanedIds }
      });

      console.log(`\n📊 Summary:`);
      console.log(`   Total orphaned surveys: ${totalOrphanedSurveys}`);
      console.log(`   Orphaned surveyor IDs: ${orphanedIds.length}`);
    } else {
      console.log('✅ No orphaned surveyor references found!');
    }

    // Optional: Show some sample orphaned survey data
    if (orphanedIds.length > 0) {
      console.log('\n🔍 Sample orphaned survey data:');
      const sampleSurvey = await Survey.findOne({ surveyorId: orphanedIds[0] });
      if (sampleSurvey) {
        console.log(`   Survey ID: ${sampleSurvey._id}`);
        console.log(`   Created: ${sampleSurvey.createdAt}`);
        console.log(`   Status: ${sampleSurvey.status}`);
        console.log(`   Voter Phone: ${sampleSurvey.voterPhoneNumber}`);
      }
    }

  } catch (error) {
    console.error('❌ Error finding orphaned surveyors:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the function
findOrphanedSurveyors();
