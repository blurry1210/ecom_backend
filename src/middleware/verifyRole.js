
const User = require('../models/User');

const verifyDistributor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || user.role !== 'distributor') {
            return res.status(403).json({ message: 'Access denied: Only distributors can add products.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = verifyDistributor;
