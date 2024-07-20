const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define the Item schema
const itemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required."],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required."],
    min: [1, "Quantity must be at least 1"],
  },
  salesPrice: {
    type: Number,
    required: [true, "Sales price is required."],
    min: [0, "Sales price must be at least 0"],
  },
});

// Define the Order schema
const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    status: {
      type: String,
      enum: ["received", "shipped", "cancelled"],
      default: "received",
    },
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
    },
    streetHouseNumber: {
      type: String,
      required: [true, "Street and house number are required."],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
      required: [true, "ZIP code is required."],
    },
    items: [itemSchema],
    totalSalesPrice: {
      type: Number,
      required: [true, "Total sales price is required."],
      min: [0, "Total sales price must be at least 0"],
    },
    trackingId: {
      type: String,
      trim: true,
      default: null,
    },
    shippedAt: {
        type: Date,
        default: null,
    },
    cancellationReason: {
      type: String,
      enum: [null, "stock problem", "customer request"],
      default: null,
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

module.exports = Order;
