const mongoose = require("mongoose");

const visaSchema = new mongoose.Schema(
  {
    country: { type: String, required: true }, // country to which visa applies
    title: { type: String, required: true },
    description: { type: String },
    requirements: [{ type: String }], // list of requirements
    processingTime: { type: String }, // e.g. "2-4 weeks"
    fee: { type: String }, // e.g. "USD 160"
    image: {
      url: String,
      public_id: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visa", visaSchema);
