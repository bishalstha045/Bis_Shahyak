import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;
let mongodInstance = null;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    // Attempt connection to configured MONGO_URI
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  External MongoDB at ${env.MONGO_URI} is not running (${error.message}).`);
    console.log(`⏳ Starting embedded MongoDB Server for complete local persistence...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`✅ Embedded MongoDB running & connected successfully: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`❌ Failed to start embedded MongoDB: ${memError.message}`);
    }
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDbInfo() {
  return {
    connected: isDbConnected(),
    type: mongodInstance ? 'Embedded MongoDB Engine (Active)' : 'MongoDB Server',
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'bis_sahayak'
  };
}
