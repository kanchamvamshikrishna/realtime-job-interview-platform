import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (env.mongoUri.startsWith('mongodb+srv://')) {
    // Some Windows/VPN setups hand Node a link-local DNS server it can't
    // actually reach, which breaks the SRV lookup Atlas connection strings
    // rely on. Pinning to a public resolver here avoids that failure mode.
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
