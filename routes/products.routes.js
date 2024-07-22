const { default: mongoose } = require("mongoose");
const Product = require("../models/Product.model");
const Stock = require("../models/Stock.model");
const Varient = require("../models/Varient.model");

const router = require("express").Router();

// GET ALL VARIENTS

router.get("/varients", async (req, res, next) => {
  try {
    const varientsData = await Varient.find().populate("productId");
    res.json(varientsData);
  } catch (error) {
    next(error);
  }
});

// GET VARIENT BY ID

router.get("/varients/:varientId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.varientId)) {
      res.status(500).json("Invalid Id");
    } else {
      const varientData = await Varient.findById(req.params.varientId).populate(
        "productId"
      );
      res.json(varientData);
    }
  } catch (error) {
    next(error);
  }
});

// CREATE VARIENT AND/OR PRODUCT

router.post("/", async (req, res) => {
  const {
    productId,
    name,
    description,
    material,
    category,
    price,
    color,
    size,
    imageUrl,
  } = req.body;

  try {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      const newProduct = await Product.create({
        name,
        category,
        description,
        material,
      });
      if (!newProduct) {
        throw new Error("Failed to create product");
      }
      const newVarient = await Varient.create({
        productId: newProduct._id,
        category: category,
        price: price,
        color: color,
        size: size,
        imageUrl: imageUrl,
      });
      if (!newVarient) {
        throw new Error("Failed to create varient");
      }
      const newStock = await Stock.create({
        varientId: newVarient._id,
      });
      if (!newStock) {
        throw new Error("Failed to create stock");
      }
      res
        .status(201)
        .json({ product: newProduct, varient: newVarient, stock: newStock });
    } else {
      const newVarient = await Varient.create({
        productId: existingProduct._id,
        category: category,
        price: price,
        color: color,
        size: size,
        imageUrl: imageUrl,
      });
      if (!newVarient) {
        throw new Error("Failed to create varient");
      }
      const newStock = await Stock.create({
        varientId: newVarient._id,
      });
      if (!newStock) {
        throw new Error("Failed to create stock");
      }
      res.status(201).json({
        product: existingProduct,
        varient: newVarient,
        stock: newStock,
      });
    }
    // All operations completed successfully
  } catch (error) {
    console.error(error);
    res.status(400).json("An error occurred while processing the request.");
  }
});

// UPDATE PRODUCT

router.put("/:productId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      res.status(500).json("Invalid Id");
    } else {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.productId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json(updatedProduct);
    }
  } catch (error) {
    next(error);
  }
});

// UPDATE VARIENT

router.put("/varients/:varientId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.varientId)) {
      res.status(500).json("Invalid Id");
    } else {
      const existingProduct = await Product.findById(req.body.productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updatedVarient = await Varient.findByIdAndUpdate(
        req.params.varientId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json(updatedVarient);
    }
  } catch (error) {
    next(error);
  }
});

// ACTIVATE/DIACTIVATE A VARIENT

router.put("/varients/activate/:varientId", async (req, res, next) => {
  const { active } = req.body;
  try {
    if (!mongoose.isValidObjectId(req.params.varientId)) {
      res.status(500).json("Invalid Id");
    } else {
      const updatedVarient = await Varient.findByIdAndUpdate(
        req.params.varientId,
        { $set: { active: active } },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json(updatedVarient);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE A VARIENT

router.delete("/varients/:varientId", async (req, res, next) => {
  const { varientId } = req.params;
  try {
    if (!mongoose.isValidObjectId(varientId)) {
      res.status(500).json("Invalid Id");
    } else {
      const deleteVarient = await Varient.findByIdAndDelete(
        varientId
      );
      if (!deleteVarient) {
        throw new Error("Failed to delete varient");
      }
      const deleteStock = await Stock.findOneAndDelete({
        varientId: varientId,
      });
      if (!deleteStock) {
        throw new Error("Failed to delete stock");
      }
      res.status(200).json("Varient and stock deleted");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
