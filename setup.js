const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Voter API...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/voter-api

# Server Configuration
PORT=3000

# Optional: MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voter-api?retryWrites=true&w=majority`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('✅ .env file already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ uploads directory already exists');
}

// Check if MongoDB is running
const { exec } = require('child_process');
exec('mongod --version', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas');
    console.log('   For local MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('   For MongoDB Atlas: https://www.mongodb.com/atlas');
  } else {
    console.log('✅ MongoDB is available');
  }
});

console.log('\n📋 Setup Instructions:');
console.log('1. Make sure MongoDB is running (local or Atlas)');
console.log('2. Update .env file with your MongoDB connection string');
console.log('3. Run: npm start');
console.log('4. Test the API: node test-api.js');
console.log('\n🚀 Ready to go!');
