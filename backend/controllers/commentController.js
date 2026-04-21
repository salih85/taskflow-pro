const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.addComment = async (req, res, next) => {
  try {
    const { text, taskId } = req.body;
    if (!text || !taskId) {
      return res.status(400).json({ message: 'Comment text and taskId are required' });
    }

    const task = await Task.findById(taskId);
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

    const comment = await Comment.create({
      text,
      userId: req.user.id,
      taskId,
    });

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name');
    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

exports.getCommentsByTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    const isMember = project.createdBy.equals(req.user.id) || project.members.some((member) => member.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
