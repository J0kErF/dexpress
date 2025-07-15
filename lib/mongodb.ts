import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in your .env.local file");
}

// At this point, MONGODB_URI is guaranteed to be a string
const uri: string = MONGODB_URI;

type MongoConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalMongo = globalThis as typeof globalThis & {
  _mongo: MongoConnection;
};

if (!globalMongo._mongo) {
  globalMongo._mongo = { conn: null, promise: null };
}

export async function connectToDB(): Promise<typeof mongoose> {
  if (globalMongo._mongo.conn) return globalMongo._mongo.conn;

  if (!globalMongo._mongo.promise) {
    globalMongo._mongo.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  globalMongo._mongo.conn = await globalMongo._mongo.promise;
  return globalMongo._mongo.conn;
}
