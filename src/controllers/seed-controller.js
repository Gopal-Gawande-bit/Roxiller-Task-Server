const productService = require("../services/product-service")

const seedDatabase = async (req, res) => {
  try {
    // Fetch products from third-party API
    const products = await productService.fetchProductsFromAPI()
    // Seed the database with products
    const response = await productService.seedProducts(products)
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getProductsByMonth = async (req, res) => {
  try {
    const { month } = req.params
    if (!month || month < 1 || month > 12) {
      return res
        .status(400)
        .json({ message: "Invalid month, should be between 1 and 12" })
    }
    // Fetch products sold in the given month
    const products = await productService.getProductsByMonth(Number(month))
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  seedDatabase,
  getProductsByMonth,
}
