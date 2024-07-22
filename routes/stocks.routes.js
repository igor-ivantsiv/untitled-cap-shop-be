const { default: mongoose } = require("mongoose");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/stocks

router.put("/update/:varientId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { varientId: req.params.varientId },
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

router.put("/reservation/:varientId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { varientId: req.params.varientId },
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

router.put("/dereservation/:varientId", async (req, res, next) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { varientId: req.params.varientId },
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
