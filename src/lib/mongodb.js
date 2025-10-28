import mongoose from 'mongoose';

const mongoURI = import.meta.env?.VITE_MONGODB_URI;

if (!mongoURI) {
  throw new Error('Missing MongoDB environment variable. Please check your .env file for VITE_MONGODB_URI');
}

// MongoDB connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create a cached connection variable
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to get MongoDB connection (with connection pooling)
export async function getMongoDBConnection() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectDB();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Initialize connection
connectDB();

export default mongoose;