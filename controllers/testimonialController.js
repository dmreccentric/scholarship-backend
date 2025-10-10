const Testimonial = require("../models/Testimonials");
const asyncHandler = require("../middlewares/asyncHandler");
const { cloudinary } = require("../middlewares/uploadTestimonial");
const mongoose = require("mongoose");

// Create testimonial
exports.createTestimonial = asyncHandler(async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;

  if (req.files?.profilePicture?.[0]) {
    const file = req.files.profilePicture[0];
    data.profilePicture = {
      url: file.path || file.secure_url,
      public_id: file.filename || file.public_id,
      resource_type: "image",
    };
  }

  if (req.files?.media?.[0]) {
    const file = req.files.media[0];
    data.media = {
      url: file.path || file.secure_url,
      public_id: file.filename || file.public_id,
      resource_type: file.mimetype?.startsWith("video/") ? "video" : "image",
    };
  }

  const testimonial = await Testimonial.create(data);
  res.status(201).json({ success: true, data: testimonial });
});

// Get all testimonials (public)
exports.getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: testimonials.length, data: testimonials });
});

// Get single testimonial
exports.getTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid ID");
    err.statusCode = 400;
    throw err;
  }

  const testimonial = await Testimonial.findById(id).populate(
    "createdBy",
    "name email"
  );

  if (!testimonial) {
    const err = new Error("Testimonial not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: testimonial });
});

// Update testimonial
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  if (req.files?.profilePicture?.[0]) {
    const file = req.files.profilePicture[0];
    update.profilePicture = {
      url: file.path,
      public_id: file.filename,
      resource_type: "image",
    };
  }

  if (req.files?.media?.[0]) {
    const file = req.files.media[0];
    update.media = {
      url: file.path,
      public_id: file.filename,
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
    };
  }

  const testimonial = await Testimonial.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!testimonial) throw new Error("Testimonial not found");
  res.json({ success: true, data: testimonial });
});

// Delete testimonial
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findByIdAndDelete(id);

  if (!testimonial) {
    const err = new Error("Testimonial not found");
    err.statusCode = 404;
    throw err;
  }

  // Delete cloudinary media
  for (const field of ["media", "profilePicture"]) {
    if (testimonial[field]?.public_id) {
      try {
        await cloudinary.uploader.destroy(testimonial[field].public_id, {
          resource_type: testimonial[field].resource_type || "image",
        });
      } catch (e) {
        console.warn(`Could not delete ${field}:`, e.message);
      }
    }
  }

  res.json({ success: true, message: "Deleted" });
});
