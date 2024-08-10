const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, role } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role
    });

    await user.save();

    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex')
    });
    await token.save();

    const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify/${user._id}/${token.token}`;
    await sendEmail({
      email: user.email,
      subject: "Verify Email",
      message: `Please verify your email by clicking the link: ${verificationUrl}`
    });

    res.status(201).json({ message: 'User registered, verification email sent', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.verifyEmail = async (req, res) => {
  try {
    const { userId, token } = req.params;

    const tokenDoc = await Token.findOne({ userId, token });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.verified = true;
    await user.save();

    await tokenDoc.remove();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your account. Check your email.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  
    res.status(200).json(users);      
  } catch (error) {
    console.error('Error fetching users:', error);  
    res.status(500).json({ message: 'Failed to fetch users' }); 
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  try {
    const tokenDoc = await Token.findOne({ userId, token });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await tokenDoc.remove();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex'),
    });
    await token.save();

    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password/${user._id}/${token.token}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `Please reset your password by clicking the link: ${resetUrl}`,
    });

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};