const express = require('express');
const router = express.Router();
const { getTaskActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/:taskId', getTaskActivities);

module.exports = router;