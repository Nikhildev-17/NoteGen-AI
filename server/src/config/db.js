import mongoose from 'mongoose';
import { config } from './env.js';

let isDbConnected = false;

export const connectDB = async () => {
  if (!config.mongoUri) {
    console.warn('MONGODB_URI is not set. Database persistence will be disabled.');
    return false;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    return false;
  }
};

export const getDbStatus = () => {
  return {
    connected: isDbConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    readyStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
};
