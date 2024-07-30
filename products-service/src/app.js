const config = require("./utils/config");
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const errorHandler = require("./utils/errorHandler");
const productsRouter = require("./routers/products");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("✅ Products-service connected to MongoDB."))
  .catch((error) =>
    console.error(
      "❌ Products-service failed to connect to MongoDB.",
      error.message
    )
  );

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);

app.use(errorHandler);

module.exports = app;
