const { Schema, model } = require("mongoose");

const stockSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
