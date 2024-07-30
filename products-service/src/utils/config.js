const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT_PRODUCTS_SERVICE;

module.exports = { MONGODB_URI, PORT };
