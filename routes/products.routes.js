const { default: mongoose } = require("mongoose");
const Product = require("../models/Product.model");
const Stock = require("../models/Stock.model");

const router = require("express").Router();
// All routes starts with /api/products

router.get("/", async (req, res) => {
  try {
    const productsData = await Product.find();
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
      const productData = await Product.findById(req.params.productId);
      res.json(productData);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    if (!newProduct) {
      throw new Error("Failed to save product");
    }
    const newStock = await Stock.create({
      productId: newProduct._id,
    });
    if (!newStock) {
      throw new Error("Failed to save stock");
    }

    // All operations completed successfully
    res.status(201).json({ product: newProduct, stock: newStock });
  } catch (error) {
    console.error(error);
    res.status(400).json("An error occurred while processing the request.");
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

router.delete("/:productId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      res.status(500).json("Invalid Id");
    } else {
      const deleteProduct = await Product.findByIdAndDelete(
        req.params.productId
      );
      if (!deleteProduct) {
        throw new Error("Failed to delete product");
      }
      const deleteStock = await Stock.findOneAndDelete({
        productId: req.params.productId,
      });
      if (!deleteStock) {
        throw new Error("Failed to delete stock");
      }
      res.status(200).json("Product and stock deleted");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
