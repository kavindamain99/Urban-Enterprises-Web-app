const mongoose = require("mongoose");

const gasModelSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  galleryImages: [{ type: String }], // Array of gallery image URLs
  video: { type: String },
  title: { type: String, required: true },
  t2: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number },
  priceStr: { type: String },

  mileage: { type: String, required: true },
  engine: { type: Number, required: true },

  transmission: { type: String, required: true },
  colour: { type: String, required: true },
  interior: { type: String, required: true },
  body: { type: String, required: true },

  wheel: { type: String, required: true },
  description: { type: String, required: true },
  safety: { type: String, required: true },
  technology: { type: String, required: true },
});

module.exports = mongoose.model("gasmodel", gasModelSchema, "gasmodel");
