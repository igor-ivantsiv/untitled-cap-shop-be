const express = require('express');
const router = express.Router();
const Order = require("../models/Order.model");

// Create a new order
router.post('/', async (req, res) => {
    try {
        const { userId, firstName, lastName, streetHouseNumber, city, zipCode, items } = req.body;

        // Calculate the total sales price
        const totalSalesPrice = items.reduce((sum, item) => {
            return sum + item.salesPrice * item.quantity;
        }, 0);

        const order = new Order({
            userId,
            firstName,
            lastName,
            streetHouseNumber,
            city,
            zipCode,
            items,
            totalSalesPrice
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/shipment/:orderId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId } = req.params;
        const { trackingId } = req.body;

        const order = await Order.findOne({ orderId }).populate('items.product').exec();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status to shipped with trackingId
        order.status = 'shipped';
        order.trackingId = trackingId;
        await order.save({ session });

        // Update realStock for each product in the order
        for (const item of order.items) {
            await Stock.updateOne({ product: item.product._id }, { $inc: { real_stock: -1 } }, { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(order);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(400).json({ error: error.message });
    }
});

router.put('/cancellation/:orderId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId } = req.params;
        const { cancellationReason } = req.body;

        const order = await Order.findOne({ orderId }).populate('items.product').exec();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status to cancelled with cancellationReason
        order.status = 'cancelled';
        order.cancellationReason = cancellationReason;
        await order.save({ session });

        // Update virtualStock for each product in the order
        for (const item of order.items) {
            await Stock.updateOne({ product: item.product._id }, { $inc: { virtual_stock: 1 } }, { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(order);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(400).json({ error: error.message });
    }
});

module.exports = router;