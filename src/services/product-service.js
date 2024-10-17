const axios = require("axios")
const Product = require("../models/product-model")

class ProductService {
  async fetchProductsFromAPI() {
    try {
      const { data } = await axios.get(
        "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
      )
      return data
    } catch (error) {
      throw new Error("Error fetching data from third-party API")
    }
  }

  async seedProducts() {
    try {
      // Clear existing products
      await Product.deleteMany({})

      // Fetch products from API
      const products = await this.fetchProductsFromAPI()

      // Insert the new products
      await Product.insertMany(products)
      return { message: "Database seeded successfully!" }
    } catch (error) {
      throw new Error("Error seeding database")
    }
  }

  async getProductsByMonth(month) {
    try {
      const monthNumber =
        new Date(Date.parse(month + " 1, 2021")).getMonth() + 1 // Convert month name to number
      const products = await Product.find({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
      })
      return products
    } catch (error) {
      throw new Error("Error fetching products by month")
    }
  }

  async getProducts({ page = 1, perPage = 10, search = "", month }) {
    try {
      let query = {}

      // Build query based on search parameters
      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { price: { $regex: search, $options: "i" } },
          ],
        }
      }

      // Add month filter if provided
      if (month) {
        const monthNumber =
          new Date(Date.parse(month + " 1, 2021")).getMonth() + 1 // Convert month name to number
        query.dateOfSale = {
          $gte: new Date(new Date().getFullYear(), monthNumber - 1, 1),
          $lt: new Date(new Date().getFullYear(), monthNumber, 1),
        }
      }

      // Pagination logic
      const products = await Product.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage)

      const totalCount = await Product.countDocuments(query)

      return {
        success: true,
        totalCount,
        page,
        perPage,
        data: products,
      }
    } catch (error) {
      throw new Error("Server error while fetching products")
    }
  }

  // New method for statistics
  async getMonthlyStatistics(month) {
    try {
      const monthNumber =
        new Date(Date.parse(month + " 1, 2021")).getMonth() + 1 // Convert month name to number

      // Get total sold items and total sales amount
      const soldItems = await Product.aggregate([
        {
          $match: {
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
          },
        },
        {
          $group: {
            _id: null,
            totalSalesAmount: { $sum: "$price" },
            totalSoldItems: { $sum: 1 },
          },
        },
      ])

      // Calculate total unsold items for the month
      const totalItems = await Product.countDocuments()
      const totalSoldItems =
        soldItems.length > 0 ? soldItems[0].totalSoldItems : 0
      const totalNotSoldItems = totalItems - totalSoldItems

      return {
        success: true,
        totalSalesAmount:
          soldItems.length > 0 ? soldItems[0].totalSalesAmount : 0,
        totalSoldItems,
        totalNotSoldItems,
      }
    } catch (error) {
      throw new Error("Error fetching monthly statistics")
    }
  }

  async getPriceRangeStatistics(month) {
    try {
      const monthNumber =
        new Date(Date.parse(month + " 1, 2021")).getMonth() + 1 // Convert month name to number

      // Define price ranges
      const priceRanges = [
        { range: "0 - 100", count: 0 },
        { range: "101 - 200", count: 0 },
        { range: "201 - 300", count: 0 },
        { range: "301 - 400", count: 0 },
        { range: "401 - 500", count: 0 },
        { range: "501 - 600", count: 0 },
        { range: "601 - 700", count: 0 },
        { range: "701 - 800", count: 0 },
        { range: "801 - 900", count: 0 },
        { range: "901 - above", count: 0 },
      ]

      const products = await Product.find({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
      })

      // Count items in each price range
      products.forEach((product) => {
        const price = product.price
        if (price <= 100) priceRanges[0].count++
        else if (price <= 200) priceRanges[1].count++
        else if (price <= 300) priceRanges[2].count++
        else if (price <= 400) priceRanges[3].count++
        else if (price <= 500) priceRanges[4].count++
        else if (price <= 600) priceRanges[5].count++
        else if (price <= 700) priceRanges[6].count++
        else if (price <= 800) priceRanges[7].count++
        else if (price <= 900) priceRanges[8].count++
        else priceRanges[9].count++
      })

      return {
        success: true,
        data: priceRanges,
      }
    } catch (error) {
      throw new Error("Error fetching price range statistics")
    }
  }

  async getUniqueCategoriesByMonth(month) {
    try {
      const monthNumber =
        new Date(Date.parse(month + " 1, 2021")).getMonth() + 1 // Convert month name to number

      const categories = await Product.aggregate([
        {
          $match: {
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
          },
        },
        {
          $group: {
            _id: "$category", // Group by category
            itemCount: { $sum: 1 }, // Count items in each category
          },
        },
      ])

      return categories.map((category) => ({
        category: category._id,
        itemCount: category.itemCount,
      }))
    } catch (error) {
      throw new Error("Error fetching unique categories by month")
    }
  }

  async getCombinedStatistics(month) {
    try {
      const statistics = await this.getMonthlyStatistics(month)
      const barChartData = await this.getPriceRangeStatistics(month)
      const pieChartData = await this.getUniqueCategoriesByMonth(month)

      return {
        statistics,
        barChartData,
        pieChartData,
      }
    } catch (error) {
      throw new Error("Error fetching combined statistics")
    }
  }
}

module.exports = new ProductService()
