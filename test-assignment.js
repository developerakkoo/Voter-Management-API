const axios = require('axios');

// Configuration
const BASE_URL = 'https://voter.myserverdevops.com/api';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual token

// Test data - replace with your actual data
const testData = {
  subAdminId: 'YOUR_SUB_ADMIN_ID', // Replace with actual sub admin ID
  voterIds: [
    // Replace with your actual voter IDs
    // '64f8a1b2c3d4e5f6a7b8c9d1',
    // '64f8a1b2c3d4e5f6a7b8c9d2',
  ],
  voterType: 'Voter', // or 'VoterFour'
  notes: 'Test assignment'
};

const testAssignment = async () => {
  try {
    console.log('Testing assignment endpoint...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/assignment/assign`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error occurred:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

// Helper function to get some sample voter IDs
const getSampleVoterIds = async () => {
  try {
    console.log('Fetching sample voter IDs...');
    
    const response = await axios.get(`${BASE_URL}/voter?limit=5`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (response.data.success && response.data.data.length > 0) {
      const sampleIds = response.data.data.map(voter => voter._id);
      console.log('Sample Voter IDs:', sampleIds);
      return sampleIds;
    }
    
  } catch (error) {
    console.log('Error fetching sample IDs:', error.message);
  }
  
  return [];
};

// Helper function to get sample sub admin IDs
const getSampleSubAdminIds = async () => {
  try {
    console.log('Fetching sample sub admin IDs...');
    
    const response = await axios.get(`${BASE_URL}/subadmin?limit=5`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (response.data.success && response.data.data.length > 0) {
      const sampleIds = response.data.data.map(subAdmin => subAdmin._id);
      console.log('Sample Sub Admin IDs:', sampleIds);
      return sampleIds;
    }
    
  } catch (error) {
    console.log('Error fetching sample sub admin IDs:', error.message);
  }
  
  return [];
};

const main = async () => {
  console.log('=== Assignment API Test ===\n');
  
  // Check if test data is configured
  if (testData.subAdminId === 'YOUR_SUB_ADMIN_ID' || testData.voterIds.length === 0) {
    console.log('⚠️  Please configure the test data first:');
    console.log('1. Update AUTH_TOKEN with your actual token');
    console.log('2. Update subAdminId with actual sub admin ID');
    console.log('3. Update voterIds with actual voter IDs');
    console.log('\nOr run with --get-samples to fetch sample IDs');
    
    if (process.argv.includes('--get-samples')) {
      await getSampleVoterIds();
      await getSampleSubAdminIds();
    }
    
    return;
  }
  
  await testAssignment();
};

if (require.main === module) {
  main();
}

module.exports = { testAssignment, getSampleVoterIds, getSampleSubAdminIds };
