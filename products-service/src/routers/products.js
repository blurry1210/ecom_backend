const express = require("express");
const { getProducts, getProductById } = require("../controllers/products");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
