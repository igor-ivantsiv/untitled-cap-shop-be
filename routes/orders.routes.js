const express = require("express");
const router = express.Router();
const Order = require("../models/Order.model");
const Stock = require("../models/Stock.model");

// Create a new order
router.post("/", async (req, res, next) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      streetHouseNumber,
      city,
      zipCode,
      items,
    } = req.body;

    const totalSalesPrice = items.reduce((sum, item) => {
      return sum + item.salesPrice * item.quantity;
    }, 0);

    const newOrder = await Order.create({
      userId,
      firstName,
      lastName,
      streetHouseNumber,
      city,
      zipCode,
      items,
      totalSalesPrice,
    });
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

router.put("/shipment/:orderId", async (req, res, next) => {
    const { orderId } = req.params;
    const { trackingId } = req.body;
   
    try {
        // Update the order status and tracking ID
        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (existingOrder.status === "shipped") {
            return res.status(400).json({ error: "Order is already shipped" });
        }

        if (existingOrder.status === "cancelled") {
            return res.status(400).json({ error: "Order is cancelled" });
        }

        const shipment = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: "shipped", trackingId: trackingId,  shippedAt: new Date()} },
            { new: true }
        );

        // Update the stock by reducing realStock for each product in the order
        const orderItems = shipment.items;
        await Promise.all(orderItems.map(async (item) => {
            await Stock.findOneAndUpdate(
                { productId: item.productId },
                { $inc: { realStock: -item.quantity } }
            );
        }));

        res.status(200).json(shipment);
    } catch (error) {
        next(error);
    }
});

router.put("/cancellation/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;
   
    try {
        // Update the order status and tracking ID
        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (existingOrder.status === "shipped") {
            return res.status(400).json({ error: "Order is shipped" });
        }

        if (existingOrder.status === "cancelled") {
            return res.status(400).json({ error: "Order is already cancelled" });
        }

        const cancellation = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: "cancelled", cancellationReason: cancellationReason,  cancelledAt: new Date()} },
            { new: true }
        );

        // Update the real stock if there is a problem with the item
        const orderItems = cancellation.items;
        if (cancellationReason === "stock problem"){
            await Promise.all(orderItems.map(async (item) => {
                await Stock.findOneAndUpdate(
                    { productId: item.productId },
                    { $inc: { realStock: -item.quantity } }
                );
            }));  
        }
        // Update the virtual stock if there is NO problem with the item
        if (cancellationReason === "customer request"){
            await Promise.all(orderItems.map(async (item) => {
                await Stock.findOneAndUpdate(
                    { productId: item.productId },
                    { $inc: { virtualStock: +item.quantity } }
                );
            }));
        }
        res.status(200).json(cancellation);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
