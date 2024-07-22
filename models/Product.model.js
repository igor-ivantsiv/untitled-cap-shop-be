const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "category is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    material: {
      type: String,
      trim: true,
      required: [true, "Material is required."],
    },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);

module.exports = Product;
