const config = require("./utils/config");
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const errorHandler = require("./utils/errorHandler");
const usersRouter = require("./routers/users");
const loginRouter = require("./routers/login");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("✅ Users-service connected to MongoDB."))
  .catch((error) =>
    console.error(
      "❌ Users-service failed to connect to MongoDB.",
      error.message
    )
  );

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(errorHandler);

module.exports = app;
