const Cart = require("../models/Cart.model");
const Stock = require("../models/Stock.model");

const updateStock = async (userId) => {
  try {
    const userCart = await Cart.findOne({ userId });

    if (userCart && userCart.content.length > 0) {
      userCart.content.forEach(async (product) => {
        await Stock.findOneAndUpdate(
          { variantId: product.variantId },
          { $inc: { virtualStock: product.quantity } },
          { new: true }
        );
      });
    }
  } catch (error) {
    console.error("ERROR UPDATING STOCK: ", error);
  }
};

const clearCart = async (userId) => {
  try {
    const userCart = await Cart.findOne({ userId });
    if (userCart) {
      userCart.content = [];
      await userCart.save();
    }
  } catch (error) {
    console.error("ERROR CLEARING CART: ", error);
  }
};

const updateStockAndClearCart = async (userId) => {
    try {
        await updateStock(userId);
        await clearCart(userId);
    } catch (error) {
        console.error("ERROR IN ONE OF THE OPERATIONS: ", error)
    }
}

module.exports = {
    updateStock,
    clearCart,
    updateStockAndClearCart
}
