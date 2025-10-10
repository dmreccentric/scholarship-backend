const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    message: { type: String, required: true },

    // 🌄 Profile picture
    profilePicture: {
      url: String,
      public_id: String,
      resource_type: { type: String, enum: ["image"], default: "image" },
    },

    // 🎥 Main testimonial media (image/video)
    media: {
      url: String,
      public_id: String,
      resource_type: {
        type: String,
        enum: ["image", "video"],
        default: "image",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
