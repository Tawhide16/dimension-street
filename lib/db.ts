import mongoose from "mongoose";
import dns from "dns";

// Fix SRV lookups on Windows / local ISP environments
if (typeof window === "undefined") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore in environments where setServers is restricted
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    // Graceful fallback to memory/seed mode if MONGODB_URI is not set
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.warn("MongoDB connection could not be established; running in robust local data mode.", e);
    return null;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
