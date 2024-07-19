const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    price: {
      type: Double,
      required: [true, "Price is required."],
      min: [0, 'Price must be at least 0']
    },
    productGroup: {
      type: String,
      required: [true, "productGroup is required."],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required."],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Size is required."], 
      enum: ['S', 'M', 'L', 'adjustable']
    },
    material: {
      type: String,
      trim: true,
      required: [true, "Material is required."],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required."],
      trim: true,
    },
    active: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);

module.exports = Product;
