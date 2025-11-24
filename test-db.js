require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');

// Check if .env file has MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file!');
  console.log('\n💡 Make sure you have a .env file with:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/easyestates\n');
  process.exit(1);
}

console.log('📋 Connection string found (first 50 chars):');
console.log('   ' + process.env.MONGODB_URI.substring(0, 50) + '...\n');

// Attempt connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB Atlas!\n');
    console.log('📊 Connection Details:');
    console.log('   Database Name:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port || 'default');
    console.log('   Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('\n🎉 Your database is ready to use!\n');
    
    // Close connection and exit
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ CONNECTION FAILED!\n');
    console.error('Error Message:', err.message);
    console.log('\n🔧 Common solutions:');
    console.log('   1. Check your username and password in the connection string');
    console.log('   2. Make sure your IP address is whitelisted in MongoDB Atlas');
    console.log('   3. Verify the connection string format is correct');
    console.log('   4. Ensure your cluster is running in MongoDB Atlas\n');
    
    if (err.message.includes('authentication failed')) {
      console.log('⚠️  Authentication Error: Check your username and password');
    } else if (err.message.includes('ENOTFOUND')) {
      console.log('⚠️  Network Error: Check your internet connection and cluster URL');
    } else if (err.message.includes('timeout')) {
      console.log('⚠️  Timeout Error: Check if your IP is whitelisted in MongoDB Atlas');
    }
    
    process.exit(1);
  });