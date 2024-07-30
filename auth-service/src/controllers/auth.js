const config = require("../utlis/config");
const jwt = require("jsonwebtoken");

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

const verifyToken = async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), config.SECRET);

  if (!decodedToken.id) {
    return res.status(401).json({ error: "token invalid" });
  }
  res.status(200).json({ id: decodedToken.id });
};

const createToken = async (req, res) => {
  const { email, id } = req.body;
  const token = jwt.sign({ email, id }, config.SECRET, {
    expiresIn: "1h",
  });
  res.status(201).json({ token });
};

module.exports = { verifyToken, createToken };
