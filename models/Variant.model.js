const { Schema, model } = require("mongoose");
const mongoose = require("mongoose")

const variantSchema = new Schema(
  {
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price must be at least 0"],
    },
    color: {
      type: String,
      required: [true, "Color is required."],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Size is required."],
      enum: ["adjustable"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required."],
      trim: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Variant = model("Variant", variantSchema);

module.exports = Variant;
