const { Schema, model } = require("mongoose");
const mongoose = require("mongoose")

const stockSchema = new Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    virtualStock: {
      type: Number,
      min: [0, "Virtual stock must be at least 0"],
      default: 0,
    },
    realStock: {
      type: Number,
      min: [0, "Real stock must be at least 0"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Stock = model("Stock", stockSchema);

module.exports = Stock;
