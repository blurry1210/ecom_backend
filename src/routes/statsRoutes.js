
const express = require('express');
const router = express.Router();
const { getDistributorStats } = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');

router.get('/distributor/:distributorId', authenticate, getDistributorStats);

module.exports = router;
