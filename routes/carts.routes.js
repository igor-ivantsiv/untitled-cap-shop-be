const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock.model");
const Cart = require("../models/Cart.model");
const mongoose = require("mongoose");

const { isAuthenticated } = require("../middlewares/route-guard.middleware");
const User = require("../models/User.model");

// GET USER'S CART
router.get("/:userId", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;

  // verify user with token
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  if (userId !== req.tokenPayload.userId) {
    res.status(403).json({ message: "Forbidden" });
    return next(new Error("User not authorized"));
  }

  try {
    // find user cart, populate content (variants)
    const userCart = await Cart.findOne({ userId })
      .select("content")
      .populate("content.variantId");
    if (!userCart) {
      res.status(404).json({ message: "User cart not found" });
      return next(new Error("User cart not found"));
    }
    res.status(200).json(userCart);
  } catch (error) {
    next(error);
  }
});

// CREATE NEW CART (on register)
router.post("/:userId", async (req, res, next) => {
  const { userId } = req.params;

  // validate user id
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  try {
    // find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return next(new Error("Existing user not found"));
    }

    // create new cart with empty content
    const newCart = await Cart.create({
      userId,
      content: [],
    });

    if (!newCart) {
      throw new Error("Failed to create cart");
    }
    res.status(201).json(newCart);
  } catch (error) {

    // if user already has a cart, respond to client
    if (error.code === 11000) {
      res.status(409).json({ message: "Cart already created for this user" });
    }
    next(error);
  }
});

// ADD ITEM TO CART
router.put("/:userId/add-item", isAuthenticated, async (req, res, next) => {
  const { variantId, quantity } = req.body;
  const { userId } = req.params;

  // verify user with token
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  if (userId !== req.tokenPayload.userId) {
    res.status(403).json({ message: "Forbidden" });
    return next(new Error("User not authorized"));
  }

  if (!mongoose.isValidObjectId(variantId)) {
    return next(new Error("invalid variant ID"));
  }

  try {
    // find user cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return next(new Error("User cart not found"));
    }

    // decrease stock for item added to cart
    const updatedStock = await Stock.findOneAndUpdate(
      { variantId },
      { $inc: { virtualStock: -quantity } },
      { new: true }
    );
    if (!updatedStock) {
      return next(new Error("Product or stock not found"))
    }

    console.log("STOCK UPDATED /add-item")
    // find existing item by id
    const itemIndex = userCart.content.findIndex(
      (item) => item.variantId.toString() === variantId.toString()
    );

    // if item already in cart -> increase quantity
    // else push new item to cart
    if (itemIndex >= 0) {
      console.log("PRODUCT FOUND IN CART /add-item");
      userCart.content[itemIndex].quantity += quantity;
    } else {
      userCart.content.push({ variantId, quantity });
    }

    await userCart.save();
    res.status(201).json(userCart);
  } catch (error) {
    next(error);
  }
});

// DECREASE QUANTITY OF ITEM IN CART
router.put(
  "/:userId/decrease-item",
  isAuthenticated,
  async (req, res, next) => {
    const { userId } = req.params;
    const { variantId, quantity } = req.body;

    // verify user with token
    if (!mongoose.isValidObjectId(userId)) {
      return next(new Error("invalid ID"));
    }

    if (userId !== req.tokenPayload.userId) {
      res.status(403).json({ message: "Forbidden" });
      return next(new Error("User not authorized"));
    }

    try {
      // find user cart
      const userCart = await Cart.findOne({ userId });
      if (!userCart) {
        return next(new Error("User cart not found"));
      }

      // find selected item in cart
      const itemIndex = userCart.content.findIndex(
        (item) => item.variantId.toString() === variantId.toString()
      );
      if (itemIndex < 0) {
        return next(new Error("PROBLEM DECREASING ITEM FROM CART"));
      }

      console.log("PRODUCT FOUND IN CART /decrease-item");

      // update stock
      const updatedStock = await Stock.findOneAndUpdate(
        { variantId },
        { $inc: { virtualStock: quantity } },
        { new: true }
      );
      if (!updatedStock) {
        return next(new Error("Product or stock not found"));
      }

      console.log("STOCK UPDATED /decrease-item");

      // update quantity in cart
      userCart.content[itemIndex].quantity -= quantity;
      await userCart.save();
      res.status(201).json(userCart);
    } catch (error) {
      next(error);
    }
  }
);

// REMOVE ITEM FROM CART
router.put("/:userId/remove-item", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  const { variantId, quantity } = req.body;

  // verify user with token
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  if (userId !== req.tokenPayload.userId) {
    res.status(403).json({ message: "Forbidden" });
    return next(new Error("User not authorized"));
  }

  try {
    // find user cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return next(new Error("User cart not found"));
    }

    // find selected item
    if (
      !userCart.content.find(
        (item) => item.variantId.toString() === variantId.toString()
      )
    ) {
      return next(new Error("PROBLEM REMOVING ITEM FROM CART"));
    }

    console.log("PRODUCT FOUND IN CART /remove-item");

    // update stock
    const updatedStock = await Stock.findOneAndUpdate(
      { variantId },
      { $inc: { virtualStock: quantity } },
      { new: true }
    );
    if (!updatedStock) {
      return next(new Error("Product or stock not found"));
    }

    console.log("STOCK UPDATED /remove-item");

    // remove item from array, update cart content
    const updatedContent = userCart.content.filter(
      (item) => item.variantId.toString() !== variantId.toString()
    );
    userCart.content = updatedContent;

    await userCart.save();
    res.status(201).json(userCart);
  } catch (error) {
    next(error);
  }
});

// EMPTY CART (restock items)
router.put("/:userId/empty-cart", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;

  // verify user with token
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  if (userId !== req.tokenPayload.userId) {
    res.status(403).json({ message: "Forbidden" });
    return next(new Error("User not authorized"));
  }

  try {
    // find user cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return next(new Error("User cart not found"));
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
      console.log("BULK OP SUCCESS: /empty-cart", bulkOpResult);
    }

    // set cart content to empty array
    userCart.content = [];
    await userCart.save();

    res.status(200).json(userCart);
  } catch (error) {
    next(error);
  }
});

// EMPTY CART AFTER SALE (don't restock items)
router.put(
  "/:userId/empty-cart/sale",
  isAuthenticated,
  async (req, res, next) => {
    const { userId } = req.params;

    // verify user with token
    if (!mongoose.isValidObjectId(userId)) {
      return next(new Error("invalid ID"));
    }

    if (userId !== req.tokenPayload.userId) {
      res.status(403).json({ message: "Forbidden" });
      return next(new Error("User not authorized"));
    }

    try {
      // find user cart
      const userCart = await Cart.findOne({ userId });
      if (!userCart) {
        return next(new Error("User cart not found"));
      }

      // set cart content to empty array
      userCart.content = [];
      await userCart.save();

      console.log("CART EMPTIED /empty-cart/sale");

      res.status(200).json(userCart);
    } catch (error) {
      next(error);
    }
  }
);

// SET CART (on reload, same session)
router.put("/:userId/set", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  const { cartContent } = req.body;

  console.log("CART CONTENT: ", cartContent)
  console.log("REQ BODY: ", req.body)

  if (!cartContent || cartContent.length < 1) {
    return next(new Error("no cart provided"));
  }

  // verify user with token
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error("invalid ID"));
  }

  if (userId !== req.tokenPayload.userId) {
    res.status(403).json({ message: "Forbidden" });
    return next(new Error("User not authorized"));
  }

  try {
    // find user cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return next(new Error("User cart not found"));
    }

    // create array of operations
    const bulkOperations = cartContent.map((item) => ({
      updateOne: {
        filter: { variantId: item.variantId },
        update: { $inc: { virtualStock: -item.quantity } },
      },
    }));

    // perform bulk operation to decrease stock for each item that was in cart
    const bulkOpResult = await Stock.bulkWrite(bulkOperations, {
      ordered: false,
    });

    // check if any operation failed
    if (bulkOpResult.hasWriteErrors()) {
      console.log("BULK OP FAILURE: ", bulkOpResult);
    } else {
      console.log("BULK OP SUCCESS: /set", bulkOpResult);
    }

    // set cart content to back to what was received in req.body
    userCart.content = cartContent;
    await userCart.save();

    res.status(200).json(userCart);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
