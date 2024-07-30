const bcrypt = require("bcrypt");
const User = require("../models/user");

const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
};

module.exports = { getUsers, getUserById, createUser };
