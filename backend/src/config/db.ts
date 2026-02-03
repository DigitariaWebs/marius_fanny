import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marius_fanny";

let mongoClient: MongoClient;
let mongoDb: ReturnType<MongoClient["db"]>;

export async function connectMongoDB() {
  if (mongoClient) {
    return { client: mongoClient, db: mongoDb };
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log("✅ MongoDB native client connected");
    return { client: mongoClient, db: mongoDb };
  } catch (error) {
    console.error("❌ MongoDB native client connection error:", error);
    throw error;
  }
}

export async function connectMongoose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Mongoose connected");
  } catch (error) {
    console.error("❌ Mongoose connection error:", error);
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  Mongoose disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Mongoose connection error:", error);
});


process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    if (mongoClient) {
      await mongoClient.close();
    }
    console.log("Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

export { mongoClient, mongoDb };