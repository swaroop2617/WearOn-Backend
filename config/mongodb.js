import mongoose from "mongoose";

const connectDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "e-commerce",   
    });

    console.log("DB Connected");

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB Error:", err);
    });

  } catch (error) {
    console.log("Connection Error:", error);
    process.exit(1);
  }
};

export default connectDb;
