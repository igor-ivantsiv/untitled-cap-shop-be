const { default: mongoose } = require("mongoose");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/stocks

router.get("/:variantId", async (req, res, next) => {
  try {
    const variantId = req.params.variantId;
    if (!mongoose.isValidObjectId(req.params.variantId)) {
      res.status(500).json("Invalid Id");
    } else {
      const stockData = await Stock.findOne({ variantId: variantId });
      res.json(stockData);
    }
  } catch (error) {
    next(error);
  }
});

router.put("/update/:variantId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { variantId: req.params.variantId },
      {
        $set: {
          virtualStock: req.body.virtualStock,
          realStock: req.body.realStock,
        },
      },
      { new: true }
    );
    if (!updatedStock) {
      return res.status(404).json({ error: "Product or stock not found" });
    }
    res.status(200).json(updatedStock);
  } catch (error) {
    next(error);
  }
});

router.put("/reservation/:variantId", async (req, res, next) => {
  try {
    const decreasedStock = parseInt(req.body.quantity)
    console.log("DECREASED STOCK: ", decreasedStock)
    const updatedStock = await Stock.findOneAndUpdate(
      { variantId: req.params.variantId },
      { $inc: { virtualStock: -decreasedStock } },
      { new: true }
    );
    if (!updatedStock) {
      return res.status(404).json({ error: "Product or stock not found" });
    }
    res.status(200).json(updatedStock);
  } catch (error) {
    next(error);
  }
});

router.put("/dereservation/:variantId", async (req, res, next) => {
  try {
    const increasedStock = parseInt(req.body.quantity)
    console.log("INCREASED STOCK: ", increasedStock)
    const updatedStock = await Stock.findOneAndUpdate(
      { variantId: req.params.variantId },
      { $inc: { virtualStock: increasedStock } },
      { new: true }
    );
    if (!updatedStock) {
      return res.status(404).json({ error: "Product or stock not found" });
    }
    res.status(200).json(updatedStock);
  } catch (error) {
    next(error);
  }
});

// body:  { itemsArr : [{id: id, quantity: 1}] }
router.put("/reservations/all", async (req, res, next) => {
  const { itemsArr } = req.body;
  try {
    const updatePromises = itemsArr.map((item) => {
      const { id, quantity } = item;
      return Stock.findOneAndUpdate(
        { variantId: id },
        { $inc: { virtualStock: -quantity } },
        { new: true }
      );
    });
    const updatedStock = await Promise.all(updatePromises);

    // log stock change
    itemsArr.forEach((item) => {
      console.log("DECREASED STOCK: ", item.quantity);
    });
    if (!updatedStock) {
      return res.status(404).json({ error: "Product or stock not found" });
    }
    res.status(200).json({message: "STOCK DECREASE SUCCESFULL"});
  } catch (error) {
    next(error);
  }
});

router.put("/dereservations/all", async (req, res, next) => {
  const { itemsArr } = req.body;
  try {
    const updatePromises = itemsArr.map((item) => {
      const { id, quantity } = item;
      return Stock.findOneAndUpdate(
        { variantId: id },
        { $inc: { virtualStock: quantity } },
        { new: true }
      );
    });
    const updatedStock = await Promise.all(updatePromises);

    // log stock change
    itemsArr.forEach((item) => {
      console.log("INCREASED STOCK: ", item.quantity);
    });
    if (!updatedStock) {
      return res.status(404).json({ error: "Product or stock not found" });
    }
    res.status(200).json({message: "STOCK INCREASE SUCCESFULL"});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
