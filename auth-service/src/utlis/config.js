const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

const SECRET = process.env.SECRET;
const PORT = process.env.PORT_AUTH_SERVICE;

module.exports = { SECRET, PORT };
