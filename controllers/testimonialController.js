const Testimonial = require("../models/Testimonials");
const asyncHandler = require("../middlewares/asyncHandler");
const mongoose = require("mongoose");

// Create Testimonial
exports.createTestimonial = asyncHandler(async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;

  if (req.file) {
    data.media = {
      url: req.file.path,
      public_id: req.file.filename,
      resource_type: req.file.mimetype.startsWith("video/") ? "video" : "image",
    };
  }

  const testimonial = await Testimonial.create(data);
  res.status(201).json({ success: true, data: testimonial });
});

// Get all testimonials (with pagination/filter)
exports.getTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, approved } = req.query;
  const query = {};

  if (approved !== undefined) query.approved = approved === "true";

  const total = await Testimonial.countDocuments(query);
  const items = await Testimonial.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, count: items.length, total, data: items });
});

// Get single testimonial
exports.getTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid ID");
    err.statusCode = 400;
    throw err;
  }

  const item = await Testimonial.findById(id).populate(
    "createdBy",
    "name email"
  );

  if (!item) {
    const err = new Error("Testimonial not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: item });
});

// Update Testimonial
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  if (req.file) {
    update.media = {
      url: req.file.path,
      public_id: req.file.filename,
      resource_type: req.file.mimetype.startsWith("video/") ? "video" : "image",
    };
  }

  const item = await Testimonial.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new Error("Testimonial not found");

  res.json({ success: true, data: item });
});

// Delete testimonial
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Testimonial.findByIdAndDelete(id);

  if (!item) {
    const err = new Error("Testimonial not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.image && item.image.public_id) {
    try {
      const { cloudinary } = require("../middlewares/upload");
      await cloudinary.uploader.destroy(item.image.public_id);
    } catch (e) {
      console.warn("Could not delete cloudinary image:", e.message);
    }
  }

  res.json({ success: true, message: "Deleted" });
});
