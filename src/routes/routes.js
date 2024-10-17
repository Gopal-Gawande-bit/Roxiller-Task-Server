const express = require("express")
const {
  seedDatabase,
  getProductsByMonth,
} = require("../controllers/seed-controller")
const ProductController = require("../controllers/product-controller")

const router = express.Router()

// // Route to seed the database
// router.get("/seed", seedDatabase)

// // Route to get products by month
// router.get("/products/:month", getProductsByMonth)

// Seed endpoint
router.get("/seed", ProductController.seedDatabase)

// Products endpoint with search and pagination
router.get("/products", ProductController.getProducts)

// Statistics endpoint
router.get("/statistics", ProductController.getMonthlyStatistics)

// GET: Price range statistics for a selected month
router.get(
  "/price-range-statistics/:month",
  ProductController.getPriceRangeStatistics
)

// New route for unique categories
router.get("/unique-categories/:month", ProductController.getUniqueCategories)

// New route for combined statistics
router.get(
  "/combined-statistics/:month",
  ProductController.getCombinedStatistics
)

module.exports = router
