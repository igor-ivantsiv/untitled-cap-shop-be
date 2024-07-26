const express = require("express");
const Variant = require("../models/Variant.model");
const { mongoose } = require("mongoose");
const Order = require("../models/Order.model");
const router = express.Router();
const bodyParser = require('body-parser');

// Stripe

const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/create-payment-intent", express.json({ type: 'application/json' }), async (req, res, next) => {
  const { items } = req.body;
  let totalSalesPrice = items.reduce((acc, item) => {
    return acc + item.salesPrice;
  }, 0);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalSalesPrice,
      currency: "eur",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
});

const endpointSecret =
  "whsec_8ff19f14d537ffbb6179b6ce60f6871881cbc0afe8411d041aa6a1bb82064367";

  router.post('/confirmation', express.raw({ type: 'application/json' }), async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event types you're interested in
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object; // Contains a PaymentIntent
        console.log('PaymentIntent was successful!');
        console.log(paymentIntent);
        // TODO: Update your order in the database as completed or similar
        try {
          const confirmedPayment = await Order.updateOne(
            { paymentIntent: paymentIntent.id }, // Make sure to use paymentIntent.id
            {
              $set: {
                status: 'received',
              },
            },
            { new: true }
          );
          console.log('Order updated:', confirmedPayment);
        } catch (error) {
          console.error('Error updating order:', error);
          return next(error);
        }
        break;
  
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object; // Contains a PaymentIntent
        console.log(`PaymentIntent failed: ${failedPayment.last_payment_error && failedPayment.last_payment_error.message}`);
        // TODO: Update your order in the database as failed or notify the user
        try {
          const paymentError = await Order.updateOne(
            { paymentIntent: failedPayment.id }, // Make sure to use failedPayment.id
            {
              $set: {
                status: 'payment error',
              },
            },
            { new: true }
          );
          console.log('Order updated:', paymentError);
        } catch (error) {
          console.error('Error updating order:', error);
          return next(error);
        }
        break;
  
  
      // Add more cases for other event types if needed
    }
  
    // Respond with a 200 status to acknowledge receipt of the event
    res.json({ received: true });
  });

module.exports = router;
