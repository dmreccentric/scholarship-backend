const Visa = require("../models/Visa");
const asyncHandler = require("../middlewares/asyncHandler");
const mongoose = require("mongoose");

// Create Visa
exports.createVisa = asyncHandler(async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;

  if (req.file) {
    data.image = {
      url: req.file.path, // Cloudinary image URL
      public_id: req.file.filename, // Cloudinary public_id
    };
  }

  // parse requirements if sent as string
  if (typeof data.requirements === "string") {
    try {
      data.requirements = JSON.parse(data.requirements);
    } catch (e) {
      data.requirements = data.requirements.split(",").map((s) => s.trim());
    }
  }

  const visa = await Visa.create(data);
  res.status(201).json({ success: true, data: visa });
});

// Get all Visas
exports.getVisas = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, country } = req.query;
  const query = {};

  if (country) query.country = country;

  const total = await Visa.countDocuments(query);
  const items = await Visa.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, count: items.length, total, data: items });
});

// Get single Visa
exports.getVisa = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid ID");
    err.statusCode = 400;
    throw err;
  }

  const item = await Visa.findById(id).populate("createdBy", "name email");

  if (!item) {
    const err = new Error("Visa not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: item });
});

// Update Visa
exports.updateVisa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  // 🚫 Prevent overwriting createdBy
  delete update.createdBy;

  if (req.file) {
    update.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  if (typeof update.requirements === "string") {
    try {
      update.requirements = JSON.parse(update.requirements);
    } catch (e) {
      update.requirements = update.requirements.split(",").map((s) => s.trim());
    }
  }

  const item = await Visa.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    const err = new Error("Visa not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: item });
});

// Delete Visa
exports.deleteVisa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Visa.findByIdAndDelete(id);

  if (!item) {
    const err = new Error("Visa not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.image && item.image.public_id) {
    try {
      const { cloudinary } = require("../middlewares/upload"); // same as your scholarship/testimonial
      await cloudinary.uploader.destroy(item.image.public_id);
    } catch (e) {
      console.warn("Could not delete cloudinary image:", e.message);
    }
  }

  res.json({ success: true, message: "Deleted" });
});
