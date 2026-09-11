import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;
let mongodInstance = null;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    // Attempt connection to configured MONGO_URI
    const timeout = env.NODE_ENV === 'production' ? 10000 : 2500;
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: timeout,
      connectTimeoutMS: timeout,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return;
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      console.error(`❌ FATAL: Production MongoDB connection to ${env.MONGO_URI} failed: ${error.message}`);
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
    console.warn(`⚠️  External MongoDB at ${env.MONGO_URI} is offline (${error.message}).`);
  }

  // Development / Local Hackathon Only: Fast-boot embedded engine
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbStorePath = path.resolve(__dirname, '../../data/db_store');

    if (!fs.existsSync(dbStorePath)) {
      fs.mkdirSync(dbStorePath, { recursive: true });
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'bis_sahayak',
        dbPath: dbStorePath,
        storageEngine: 'wiredTiger'
      }
    });
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    isConnected = true;
    console.log(`✅ Embedded Persistent MongoDB Engine active at: ${dbStorePath}`);
  } catch (memError) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: 'bis_sahayak' }
      });
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log(`✅ Embedded In-Memory MongoDB connected.`);
    } catch (finalErr) {
      console.error("❌ Fatal: Could not initialize database:", finalErr.message);
      throw new Error(`Failed to initialize database: ${finalErr.message}`);
    }
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDbInfo() {
  return {
    connected: isDbConnected(),
    type: mongodInstance ? 'Embedded MongoDB Engine' : 'MongoDB Server',
    host: mongoose.connection.host || 'localhost',
    name: mongoose.connection.name || 'bis_sahayak'
  };
}
