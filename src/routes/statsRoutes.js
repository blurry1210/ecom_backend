const express = require('express');
const router = express.Router();
const { getDistributorStats, getDistributorOrderStatuses } = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');

router.get('/distributor/:distributorId', authenticate, getDistributorStats);
router.get('/distributor/:distributorId/statuses', authenticate, getDistributorOrderStatuses);

module.exports = router;
