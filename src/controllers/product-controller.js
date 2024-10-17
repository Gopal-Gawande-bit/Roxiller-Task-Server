const ProductService = require("../services/product-service")

class ProductController {
  async seedDatabase(req, res) {
    try {
      const response = await ProductService.seedProducts()
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getProducts(req, res) {
    try {
      const { page = 1, perPage = 10, search = "", month } = req.query
      const products = await ProductService.getProducts({
        page,
        perPage,
        search,
        month,
      })
      res.status(200).json(products)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  // New method for statistics
  async getMonthlyStatistics(req, res) {
    const { month } = req.query
    try {
      if (!month) {
        return res
          .status(400)
          .json({ success: false, message: "Month parameter is required." })
      }
      const statistics = await ProductService.getMonthlyStatistics(month)
      res.status(200).json(statistics)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPriceRangeStatistics(req, res) {
    const { month } = req.params
    try {
      const statistics = await ProductService.getPriceRangeStatistics(month)
      return res.status(200).json(statistics)
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  async getUniqueCategories(req, res) {
    const { month } = req.params

    try {
      const categories = await ProductService.getUniqueCategoriesByMonth(month)
      return res.status(200).json({
        success: true,
        data: categories,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getCombinedStatistics(req, res) {
    const { month } = req.params

    try {
      const combinedData = await ProductService.getCombinedStatistics(month)
      return res.status(200).json({
        success: true,
        data: combinedData,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new ProductController()
