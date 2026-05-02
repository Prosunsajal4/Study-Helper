const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "study_assistant";

let client;
let db;

const connectDB = async () => {
  if (db) {
    return db;
  }

  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
};

const getClient = () => client;

module.exports = { connectDB, getDB, getClient };
