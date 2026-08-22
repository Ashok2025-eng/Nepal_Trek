import mongoose from "mongoose";
import process = require("node:process");

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Mongo_URI is not defined in .env");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
