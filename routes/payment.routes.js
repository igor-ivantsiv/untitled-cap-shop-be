const express = require("express");
const Variant = require("../models/Variant.model");
const { mongoose } = require("mongoose");
const router = express.Router();

// Stripe

const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/create-payment-intent", async (req, res, next) => {
  const { items } = req.body;

  let sum = 0;
  const promises = items.map(async (item) => {
    if (!mongoose.isValidObjectId(item.item)) {
      throw new Error(`Invalid Id for item: ${item.item}`); // Throwing an error, handle this upstream
    }
    try {
      const variant = await Variant.findById(item.item).select("price");
      if (variant) {
        sum += item.quantity * variant.price;
      } else {
        throw new Error(`Variant not found for item: ${item.item}`);
      }
    } catch (error) {
      throw new Error(
        `Error fetching price for item ${item.item}: ${error.message}`
      );
    }
  });
  await Promise.all(promises);
  try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: sum,
    currency: "eur",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.send({
    clientSecret: paymentIntent.client_secret, });
} catch (error) {
  next(error);
}}
);

module.exports = router;
