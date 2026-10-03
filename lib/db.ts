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

function getOptimizedUri(uri: string): string {
  // If this is the cluster0.iv15qaw.mongodb.net SRV URI, connect directly to replica set to avoid DNS SRV latency
  if (uri.includes("cluster0.iv15qaw.mongodb.net")) {
    const userPassMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
    if (userPassMatch && userPassMatch[1]) {
      return `mongodb://${userPassMatch[1]}@ac-w00blsv-shard-00-00.iv15qaw.mongodb.net:27017,ac-w00blsv-shard-00-01.iv15qaw.mongodb.net:27017,ac-w00blsv-shard-00-02.iv15qaw.mongodb.net:27017/dimension_street?ssl=true&replicaSet=atlas-x8lnib-shard-0&authSource=admin&retryWrites=true&w=majority`;
    }
  }
  return uri;
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
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    const targetUri = getOptimizedUri(MONGODB_URI);
    cached.promise = mongoose.connect(targetUri, opts).then((m) => m);
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
