import { MongoClient } from "mongodb";
import mongoose from "mongoose";

let mongoClient: MongoClient;
let mongoDb: ReturnType<MongoClient["db"]>;

export async function connectMongoDB() {
  if (mongoClient) {
    return { client: mongoClient, db: mongoDb };
  }

  try {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error("MONGODB_URI is not set");
    }
    mongoClient = new MongoClient(mongodbUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    const collections = await mongoDb
      .listCollections({}, { nameOnly: true })
      .toArray();
    const collectionNames = collections.map((collection) => collection.name);
    console.log(
      `✅ MongoDB native client connected (db: ${mongoDb.databaseName})`,
    );
    console.log(
      `📚 MongoDB collections: ${
        collectionNames.length ? collectionNames.join(", ") : "(none)"
      }`,
    );
    return { client: mongoClient, db: mongoDb };
  } catch (error) {
    console.error("❌ MongoDB native client connection error:", error);
    throw error;
  }
}

export async function connectMongoose() {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error("MONGODB_URI is not set");
    }
    await mongoose.connect(mongodbUri);
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