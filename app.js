const express = require("express")
const connectDB = require("./src/config/db")
const routes = require("./src/routes/routes")
const cors = require("cors")

const app = express()

app.use(cors())

// Connect to the database
connectDB()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1", routes)

module.exports = app
