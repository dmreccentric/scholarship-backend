const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // name of person giving testimonial
    message: { type: String, required: true },
    image: {
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
    approved: { type: Boolean, default: false }, // admin can approve before display
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
