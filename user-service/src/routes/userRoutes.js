const express = require('express');
const { createUser, verifyEmail, loginUser, getUserById } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.post('/register', createUser);
router.get('/verify/:userId/:token', verifyEmail); // Ensure this is GET
router.post('/login', loginUser);
router.get('/:userId',authenticate, getUserById);



module.exports = router;
