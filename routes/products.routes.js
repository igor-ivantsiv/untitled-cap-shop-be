const { default: mongoose } = require("mongoose");
const Product = require("../models/Product.model");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/products

router.get("/", async (req, res) => {
  try {
    const productsData = await Product.find()
    res.json(productsData);
  } catch (error) {
    next(error);
  }
});

router.get("/:productId", async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.productId)) {
        res.status(500).json("Invalid Id");
      } else {
        const productData = await Product.findById(req.params.productId)
        res.json(productData);
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res) => {
    try {
      const newProduct = await Product.create(req.body); // look into if we need to wrap this in a transaction
      const newStock = await Stock.create({
        productId: newProduct._id
      })
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:productId", async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
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

  router.delete("/:productId", async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.productId)) {
        res.status(500).json("Invalid Id");
      } else {
        await Product.findByIdAndDelete(req.params.productId);
  
        res.status(204);
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
