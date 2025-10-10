const Scholarship = require("../models/Scholarship");
const asyncHandler = require("../middlewares/asyncHandler");
const mongoose = require("mongoose");

// Create scholarship
exports.createScholarship = asyncHandler(async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;

  // If image uploaded, multer-storage-cloudinary gives us url + filename
  if (req.file) {
    data.image = {
      url: req.file.path, // secure URL from Cloudinary
      public_id: req.file.filename, // unique Cloudinary public_id
    };
  }

  // Parse eligibleCountries if sent as string
  if (typeof data.eligibleCountries === "string") {
    try {
      data.eligibleCountries = JSON.parse(data.eligibleCountries);
    } catch (e) {
      data.eligibleCountries = data.eligibleCountries
        .split(",")
        .map((s) => s.trim());
    }
  }

  const scholarship = await Scholarship.create(data);
  res.status(201).json({ success: true, data: scholarship });
});

// ✅ Get all scholarships with filters & pagination
exports.getScholarships = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { hostCountry, category, fullyFunded } = req.query;

  const query = {};
  if (hostCountry) query.hostCountry = hostCountry;
  if (category) query.category = category;
  if (fullyFunded !== undefined) query.fullyFunded = fullyFunded === "true";

  const total = await Scholarship.countDocuments(query);

  const items = await Scholarship.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    count: items.length,
    total,
    totalPages,
    currentPage: page,
    limit,
    data: items,
  });
});

// Get single scholarship
exports.getScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid ID");
    err.statusCode = 400;
    throw err;
  }

  const item = await Scholarship.findById(id).populate(
    "createdBy",
    "name email"
  );
  if (!item) {
    const err = new Error("Scholarship not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: item });
});

// Update scholarship
exports.updateScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  update.createdBy = req.user._id;

  // Parse eligibleCountries if string
  if (typeof update.eligibleCountries === "string") {
    try {
      update.eligibleCountries = JSON.parse(update.eligibleCountries);
    } catch (e) {
      update.eligibleCountries = update.eligibleCountries
        .split(",")
        .map((s) => s.trim());
    }
  }

  if (req.file) {
    update.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  const item = await Scholarship.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    const err = new Error("Scholarship not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: item });
});

// Delete scholarship
exports.deleteScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Scholarship.findByIdAndDelete(id);

  if (!item) {
    const err = new Error("Scholarship not found");
    err.statusCode = 404;
    throw err;
  }

  // optionally remove cloudinary image if public_id present
  if (item.image && item.image.public_id) {
    try {
      const { cloudinary } = require("../middlewares/upload"); // import your configured cloudinary
      await cloudinary.uploader.destroy(item.image.public_id);
    } catch (e) {
      console.warn("Could not delete cloudinary image:", e.message);
    }
  }

  res.json({ success: true, message: "Deleted" });
});
