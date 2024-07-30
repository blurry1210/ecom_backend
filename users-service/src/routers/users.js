const express = require("express");
const { getUsers, getUserById, createUser } = require("../controllers/users");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);

module.exports = router;
