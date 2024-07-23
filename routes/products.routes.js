const { default: mongoose } = require("mongoose");
const Product = require("../models/Product.model");
const Stock = require("../models/Stock.model");
const Variant = require("../models/Variant.model");

const router = require("express").Router();

// GET ALL VARIENTS

router.get("/variants", async (req, res, next) => {
  try {
    const variantsData = await Variant.find().populate("productId");
    res.json(variantsData);
  } catch (error) {
    next(error);
  }
});

// GET ALL VARIANTS PER PRODUCT
router.get("/:productId", async (req, res, next) => {
  const {productId} = req.params
  if (!mongoose.isValidObjectId(productId)) {
    return next(new Error("invalid ID"))
  }

  try {
    const variants = await Variant.find({productId: productId});
    if (!variants) {
      return next(new Error("no variants found"));
    }
    res.status(200).json(variants)
  } catch (error) {
    next(error)
  }
})

// GET VARIENT BY ID

router.get("/variants/:variantId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.variantId)) {
      res.status(500).json("Invalid Id");
    } else {
      const variantData = await Variant.findById(req.params.variantId).populate(
        "productId"
      );
      res.json(variantData);
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
      const newVariant = await Variant.create({
        productId: newProduct._id,
        category: category,
        price: price,
        color: color,
        size: size,
        imageUrl: imageUrl,
      });
      if (!newVariant) {
        throw new Error("Failed to create variant");
      }
      const newStock = await Stock.create({
        variantId: newVariant._id,
      });
      if (!newStock) {
        throw new Error("Failed to create stock");
      }
      res
        .status(201)
        .json({ product: newProduct, variant: newVariant, stock: newStock });
    } else {
      const newVariant = await Variant.create({
        productId: existingProduct._id,
        category: category,
        price: price,
        color: color,
        size: size,
        imageUrl: imageUrl,
      });
      if (!newVariant) {
        throw new Error("Failed to create variant");
      }
      const newStock = await Stock.create({
        variantId: newVariant._id,
      });
      if (!newStock) {
        throw new Error("Failed to create stock");
      }
      res.status(201).json({
        product: existingProduct,
        variant: newVariant,
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

router.put("/variants/:variantId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.variantId)) {
      res.status(500).json("Invalid Id");
    } else {
      const existingProduct = await Product.findById(req.body.productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updatedVariant = await Variant.findByIdAndUpdate(
        req.params.variantId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json(updatedVariant);
    }
  } catch (error) {
    next(error);
  }
});

// ACTIVATE/DIACTIVATE A VARIENT

router.put("/variants/activate/:variantId", async (req, res, next) => {
  const { active } = req.body;
  try {
    if (!mongoose.isValidObjectId(req.params.variantId)) {
      res.status(500).json("Invalid Id");
    } else {
      const updatedVariant = await Variant.findByIdAndUpdate(
        req.params.variantId,
        { $set: { active: active } },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json(updatedVariant);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE A VARIENT

router.delete("/variants/:variantId", async (req, res, next) => {
  const { variantId } = req.params;
  try {
    if (!mongoose.isValidObjectId(variantId)) {
      res.status(500).json("Invalid Id");
    } else {
      const deleteVariant = await Variant.findByIdAndDelete(
        variantId
      );
      if (!deleteVariant) {
        throw new Error("Failed to delete variant");
      }
      const deleteStock = await Stock.findOneAndDelete({
        variantId: variantId,
      });
      if (!deleteStock) {
        throw new Error("Failed to delete stock");
      }
      res.status(200).json("Variant and stock deleted");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
