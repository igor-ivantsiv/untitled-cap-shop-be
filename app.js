// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv').config()

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express')

const app = express()
  require('./config')(app)

const paymentRoutes = require("./routes/payment.routes");
app.use("/api/payments", paymentRoutes);

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
 // To have access to `body` property in the request
app.use(express.json())
// 👇 Start handling routes here
const indexRoutes = require('./routes/index.routes')
app.use('/api', indexRoutes)

const authRoutes = require("./routes/auth.routes")
app.use("/auth", authRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app
