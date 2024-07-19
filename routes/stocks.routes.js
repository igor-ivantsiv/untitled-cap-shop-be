const { default: mongoose } = require("mongoose");
const Product = require("../models/Product.model");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/stocks

  router.put("/reservation/:productId", async (req, res) => {
    try {
      const updatedProduct = await Stock.findByIdAndUpdate(
        req.params.productId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });

  router.put("/dereservation/:productId", async (req, res) => {
    try {
      const updatedProduct = await Stock.findByIdAndUpdate(
        req.params.productId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
