const express = require('express');
const { getDistributorStats, getDistributorOrderStatuses } = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/distributor/:distributorId', authenticate, getDistributorStats);
router.get('/distributor/:distributorId/statuses', authenticate, getDistributorOrderStatuses);

module.exports = router;
