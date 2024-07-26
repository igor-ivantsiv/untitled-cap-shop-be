const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  content: [
    {
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;