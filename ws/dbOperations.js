const Cart = require("../models/Cart.model");
const Stock = require("../models/Stock.model");

/*
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
    console.error("ERROR IN ONE OF THE OPERATIONS: ", error);
  }
};
*/

// clear cart and update stock on disconnection

const clearCartAndUpdateStock = async (userId) => {
  try {
    // find user cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      throw new Error("User cart not found");
    }

    // create array of operations
    const bulkOperations = userCart.content.map((item) => ({
      updateOne: {
        filter: { variantId: item.variantId },
        update: { $inc: { virtualStock: item.quantity } },
      },
    }));

    // perform bulk operation to increase stock for each item that was in cart
    const bulkOpResult = await Stock.bulkWrite(bulkOperations, {
      ordered: false,
    });
    if (bulkOpResult) {
      console.log("ws: BULK OP SUCCESS: ", bulkOpResult);
    }

    // set cart content to empty array
    userCart.content = [];
    await userCart.save();
  } catch (error) {
    throw new Error("ws: FAILURE CLEARING CART / UPDATING STOCK: ", error);
  }
};

module.exports = {
  clearCartAndUpdateStock,
};
