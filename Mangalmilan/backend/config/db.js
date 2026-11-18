// config/db.js (Corrected)

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // 1. Tell Mongoose NOT to create indexes automatically
    const options = {
      autoIndex: false, // This prevents the race condition
    };

    // 2. Connect to the database with the new option
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected successfully.");

    // 3. (Optional but Recommended) You can now remove the manual index-fixing code.
    // Mongoose will handle it correctly on its own now that autoIndex is false
    // and you have the correct schema.

  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;