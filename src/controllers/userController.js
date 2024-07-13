// controllers/userController.js
const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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

        const verificationUrl = `${process.env.BASE_URL}/verify/${user._id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", `Please verify your email by clicking the link: ${verificationUrl}`);

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
            role: user.role
        };
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
