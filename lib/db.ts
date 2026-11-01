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

const DEFAULT_MONGODB_URI = "mongodb+srv://protfulio:LDh8KL3JqaCGgOCn@cluster0.bw3blcg.mongodb.net/dimension_street?retryWrites=true&w=majority&appName=Cluster0";
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var __mongoListenersAttached: boolean | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Auto-recovery listeners on disconnection
if (!global.__mongoListenersAttached && typeof window === "undefined") {
  mongoose.connection.on("disconnected", () => {
    cached.conn = null;
    cached.promise = null;
  });
  mongoose.connection.on("error", () => {
    cached.conn = null;
    cached.promise = null;
  });
  global.__mongoListenersAttached = true;
}

/**
 * Converts standard SRV Atlas URIs into direct 3-node replica set URIs.
 * This completely avoids DNS SRV lookup timeouts, ECONNREFUSED errors,
 * and cold-start latency on Vercel / serverless platforms.
 */
function getOptimizedUri(uri: string): string {
  if (uri.includes("cluster0.bw3blcg.mongodb.net")) {
    const userPassMatch = uri.match(/mongodb(?:\+srv)?:\/\/([^@]+)@/);
    const auth = userPassMatch ? userPassMatch[1] : "protfulio:LDh8KL3JqaCGgOCn";
    return `mongodb://${auth}@ac-q4nh4go-shard-00-00.bw3blcg.mongodb.net:27017,ac-q4nh4go-shard-00-01.bw3blcg.mongodb.net:27017,ac-q4nh4go-shard-00-02.bw3blcg.mongodb.net:27017/dimension_street?ssl=true&replicaSet=atlas-64uczn-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
  if (uri.includes("cluster0.iv15qaw.mongodb.net")) {
    const userPassMatch = uri.match(/mongodb(?:\+srv)?:\/\/([^@]+)@/);
    if (userPassMatch && userPassMatch[1]) {
      return `mongodb://${userPassMatch[1]}@ac-w00blsv-shard-00-00.iv15qaw.mongodb.net:27017,ac-w00blsv-shard-00-01.iv15qaw.mongodb.net:27017,ac-w00blsv-shard-00-02.iv15qaw.mongodb.net:27017/dimension_street?ssl=true&replicaSet=atlas-x8lnib-shard-0&authSource=admin&retryWrites=true&w=majority`;
    }
  }
  return uri;
}

export async function connectToDatabase(retries = 2): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  // 1. If actively connected, return immediately
  if (mongoose.connection.readyState === 1 && cached.conn) {
    return cached.conn;
  }

  // 2. If currently connecting, await in-flight promise
  if (mongoose.connection.readyState === 2 && cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch {
      cached.promise = null;
      cached.conn = null;
    }
  }

  // 3. Clear any stale connection reference
  cached.conn = null;
  cached.promise = null;

  const targetUri = getOptimizedUri(MONGODB_URI);
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 1,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      cached.promise = mongoose.connect(targetUri, opts);
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      cached.conn = null;
      if (attempt === retries) {
        console.warn(`MongoDB connection attempt ${attempt}/${retries} failed; using robust fallback cache:`, e);
        return null;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return null;
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
