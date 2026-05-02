const Activity = require('../models/Activity');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTaskActivities = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.createdBy.equals(req.user.id) || project.members.some((member) => member.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activities = await Activity.find({ taskId: req.params.taskId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

exports.createActivity = async (taskId, userId, action, description, oldValue = null, newValue = null) => {
  try {
    await Activity.create({
      taskId,
      userId,
      action,
      description,
      oldValue,
      newValue,
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
  }
};