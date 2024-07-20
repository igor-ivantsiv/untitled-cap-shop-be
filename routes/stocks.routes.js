const { default: mongoose } = require("mongoose");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/stocks

router.put("/update/:productId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { productId: req.params.productId },
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

router.put("/reservation/:productId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { productId: req.params.productId },
      { $inc: { virtualStock: -1 } },
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

router.put("/dereservation/:productId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { productId: req.params.productId },
      { $inc: { virtualStock: 1 } },
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

module.exports = router;
