const express = require('express');
const { createUser, verifyEmail, loginUser, getUserById, getAllUsers,updateUserRole, deleteUser, requestPasswordReset, resetPassword } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.post('/register', createUser);
router.get('/verify/:userId/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/all', authenticate, getAllUsers);  // Route to get all users
router.get('/:userId', getUserById);

router.put('/:userId', updateUserRole);
router.delete('/:userId', deleteUser);

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:userId/:token', resetPassword);


module.exports = router;
