const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getSubtasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/:projectId', getTasksByProject);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/:id/subtasks', getSubtasks);

module.exports = router;
