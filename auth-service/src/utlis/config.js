require("dotenv").config();

const SECRET = process.env.SECRET;
const PORT = process.env.PORT;

module.exports = { SECRET, PORT };
