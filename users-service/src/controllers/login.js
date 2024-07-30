const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "missing email or password" });
  }
  const user = await User.findOne({ email });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const tokenRequest = await axios.post("http://localhost:3001/api/auth", {
    email: user.email,
    id: user.id,
  });
  const { token } = tokenRequest.data;

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

module.exports = { login };
