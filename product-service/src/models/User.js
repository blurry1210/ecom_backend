const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String, required: true, unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'distributor'], default: 'user' },
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
