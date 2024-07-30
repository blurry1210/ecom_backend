const express = require("express");
const { verifyToken, createToken } = require("../controllers/auth");

const router = express.Router();

router.get("/", verifyToken);
router.post("/", createToken);

module.exports = router;
