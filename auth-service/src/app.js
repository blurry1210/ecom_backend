require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const errorHandler = require("./utlis/errorHandler");
const authRouter = require("./routers/auth");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use(errorHandler);

module.exports = app;
