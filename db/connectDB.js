const mongoose = require("mongoose");

async function connectDB(url) {
  try {
    await mongoose.connect(url);
    console.log("Connected to the DB");
  } catch (error) {
    console.log("MongoDB connection error", error);
  }
}

module.exports = connectDB;
