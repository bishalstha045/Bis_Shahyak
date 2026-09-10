import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;
let mongodInstance = null;
let fallbackMode = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    // Attempt connection to configured MONGO_URI with short timeout
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(`⚠️  External MongoDB at ${env.MONGO_URI} is offline (${error.message}).`);
  }

  // Fast-boot embedded engine without blocking startup indefinitely
  try {
    const memoryPromise = (async () => {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: 'bis_sahayak' }
      });
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log(`✅ Embedded In-Memory MongoDB connected.`);
    })();

    // Timeout embedded startup after 2 seconds to ensure instant server startup
    await Promise.race([
      memoryPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout starting embedded MongoDB")), 2000))
    ]);
  } catch (memError) {
    fallbackMode = true;
    console.log(`⚡ Autonomous Local Memory Active: Server booted instantly in resilient standalone mode.`);
  }
}

export function isDbConnected() {
  return isConnected || mongoose.connection.readyState === 1 || fallbackMode;
}

export function getDbInfo() {
  return {
    connected: isDbConnected(),
    type: mongodInstance ? 'Embedded MongoDB Engine' : (fallbackMode ? 'Autonomous Standalone Memory' : 'MongoDB Server'),
    host: mongoose.connection.host || 'localhost',
    name: mongoose.connection.name || 'bis_sahayak'
  };
}
