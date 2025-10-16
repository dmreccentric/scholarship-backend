require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const connectDB = require("./db/connectDB");

const authRoutes = require("./routes/auth");
const scholarshipRoutes = require("./routes/scholarship");
const visaRoutes = require("./routes/visa");
const testimonialRoutes = require("./routes/testimonial");
const clientRoutes = require("./routes/clientRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

const errorHandler = require("./middlewares/errorHandler");
const corOptions = require("./config/corOptions");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Compression for smaller responses
app.use(compression());

// ✅ Global caching for API responses
app.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  next();
});

// ✅ Middleware
app.use(cors(corOptions));
app.options("*", cors(corOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/enquiry", enquiryRoutes);

// ✅ Global error handler (last)
app.use(errorHandler);

// ✅ Start server
const start = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

start();
