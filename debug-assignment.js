const mongoose = require('mongoose');
const Voter = require('./models/Voter');
const VoterFour = require('./models/VoterFour');

// Connect to MongoDB (update connection string as needed)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugVoterIds = async (voterIds, voterType) => {
  try {
    console.log(`\n=== Debugging Voter Assignment ===`);
    console.log(`Voter Type: ${voterType}`);
    console.log(`Voter IDs provided: ${voterIds.length}`);
    console.log(`Voter IDs:`, voterIds);
    
    // Select the appropriate model
    const VoterModel = voterType === 'Voter' ? Voter : VoterFour;
    
    // Check if all IDs are valid ObjectIds
    const validObjectIds = [];
    const invalidObjectIds = [];
    
    voterIds.forEach(id => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validObjectIds.push(id);
      } else {
        invalidObjectIds.push(id);
      }
    });
    
    console.log(`\nValid ObjectIds: ${validObjectIds.length}`);
    console.log(`Invalid ObjectIds: ${invalidObjectIds.length}`);
    
    if (invalidObjectIds.length > 0) {
      console.log('Invalid IDs:', invalidObjectIds);
    }
    
    // Find existing voters
    const existingVoters = await VoterModel.find({ _id: { $in: validObjectIds } });
    console.log(`\nFound voters in database: ${existingVoters.length}`);
    
    // Find which IDs are missing
    const foundIds = existingVoters.map(v => v._id.toString());
    const missingIds = validObjectIds.filter(id => !foundIds.includes(id.toString()));
    
    console.log(`Missing voter IDs: ${missingIds.length}`);
    if (missingIds.length > 0) {
      console.log('Missing IDs:', missingIds);
    }
    
    // Check if voters exist in the other collection
    const OtherModel = voterType === 'Voter' ? VoterFour : Voter;
    const votersInOtherCollection = await OtherModel.find({ _id: { $in: validObjectIds } });
    
    if (votersInOtherCollection.length > 0) {
      console.log(`\n⚠️  Found ${votersInOtherCollection.length} voters in the OTHER collection (${voterType === 'Voter' ? 'VoterFour' : 'Voter'})`);
      console.log('This suggests you might be using the wrong voterType!');
    }
    
    // Show sample of found voters
    if (existingVoters.length > 0) {
      console.log('\nSample of found voters:');
      existingVoters.slice(0, 3).forEach(voter => {
        console.log(`- ID: ${voter._id}, Name: ${voter['Voter Name Eng'] || 'N/A'}, CardNo: ${voter.CardNo || 'N/A'}`);
      });
    }
    
    // Show total counts in both collections
    const [voterCount, voterFourCount] = await Promise.all([
      Voter.countDocuments(),
      VoterFour.countDocuments()
    ]);
    
    console.log(`\nTotal voters in Voter collection: ${voterCount}`);
    console.log(`Total voters in VoterFour collection: ${voterFourCount}`);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Example usage - replace with your actual data
const main = async () => {
  await connectDB();
  
  // Replace these with your actual voter IDs and voter type
  const exampleVoterIds = [
    // Add your actual voter IDs here
    // "64f8a1b2c3d4e5f6a7b8c9d1",
    // "64f8a1b2c3d4e5f6a7b8c9d2",
  ];
  
  const exampleVoterType = "Voter"; // or "VoterFour"
  
  if (exampleVoterIds.length > 0) {
    await debugVoterIds(exampleVoterIds, exampleVoterType);
  } else {
    console.log('Please add your voter IDs to the exampleVoterIds array and run again');
  }
  
  process.exit(0);
};

if (require.main === module) {
  main();
}

module.exports = { debugVoterIds };
