const express = require('express');
const router = express.Router();
const { sendPasswordResetEmail } = require('../controllers/authController');
const { createUser, loginUser } = require('../controllers/userController');

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/forgot-password', sendPasswordResetEmail);

module.exports = router;
