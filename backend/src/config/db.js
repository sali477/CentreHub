import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/centrehub_morocco';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB connection failed: ${error.message}`);
    console.error('   Start MongoDB, then run: cd backend && npm run dev');
    console.error(`   URI: ${uri}\n`);
    process.exit(1);
  }
};

export default connectDB;
