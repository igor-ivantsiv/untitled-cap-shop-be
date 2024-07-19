const router = require('express').Router()

router.get('/', (req, res) => {
  res.json('All good in here')
})

const productsRoutes = require("./products.routes");
router.use("/products", productsRoutes);

const stocksRoutes = require("./stocks.routes");
router.use("/stocks", stocksRoutes);


module.exports = router
