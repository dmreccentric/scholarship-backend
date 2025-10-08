const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    hostCountry: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Masters", "PhD", "Undergrad", etc.
    eligibleCountries: [{ type: String }], // array of country codes/names
    reward: { type: String }, // free-text
    stipend: { type: String }, // e.g. "€1000/month" or number if you prefer
    deadline: { type: Date },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    healthInsurance: { type: Boolean, default: false },
    ieltsRequired: { type: Boolean, default: false },
    fullyFunded: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);
