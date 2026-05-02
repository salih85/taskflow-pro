const Task = require('../models/Task');
const Project = require('../models/Project');
const { createActivity } = require('./activityController');

exports.getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.createdBy.equals(req.user.id) || project.members.some((member) => member.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId, labels, attachments, timeEstimate, timeSpent, dependencies, progress, parentId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Task title and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.createdBy.equals(req.user.id) || project.members.some((member) => member.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      projectId,
      labels,
      attachments,
      timeEstimate,
      timeSpent,
      dependencies,
      progress,
      parentId,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
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

    const { title, description, status, priority, dueDate, assignedTo, labels, attachments, timeEstimate, timeSpent, dependencies, progress, parentId } = req.body;
    const changes = [];

    if (title !== undefined && title !== task.title) {
      changes.push({ field: 'title', old: task.title, new: title });
      task.title = title;
    }
    if (description !== undefined && description !== task.description) {
      changes.push({ field: 'description', old: task.description, new: description });
      task.description = description;
    }
    if (status !== undefined && status !== task.status) {
      changes.push({ field: 'status', old: task.status, new: status });
      task.status = status;
    }
    if (priority !== undefined && priority !== task.priority) {
      changes.push({ field: 'priority', old: task.priority, new: priority });
      task.priority = priority;
    }
    if (dueDate !== undefined && dueDate !== task.dueDate?.toISOString().split('T')[0]) {
      changes.push({ field: 'dueDate', old: task.dueDate, new: dueDate });
      task.dueDate = dueDate;
    }
    if (assignedTo !== undefined && assignedTo !== task.assignedTo?.toString()) {
      changes.push({ field: 'assignedTo', old: task.assignedTo, new: assignedTo });
      task.assignedTo = assignedTo;
    }
    if (labels !== undefined) {
      changes.push({ field: 'labels', old: task.labels, new: labels });
      task.labels = labels;
    }
    if (attachments !== undefined) {
      changes.push({ field: 'attachments', old: task.attachments, new: attachments });
      task.attachments = attachments;
    }
    if (timeEstimate !== undefined && timeEstimate !== task.timeEstimate) {
      changes.push({ field: 'timeEstimate', old: task.timeEstimate, new: timeEstimate });
      task.timeEstimate = timeEstimate;
    }
    if (timeSpent !== undefined && timeSpent !== task.timeSpent) {
      changes.push({ field: 'timeSpent', old: task.timeSpent, new: timeSpent });
      task.timeSpent = timeSpent;
    }
    if (dependencies !== undefined) {
      changes.push({ field: 'dependencies', old: task.dependencies, new: dependencies });
      task.dependencies = dependencies;
    }
    if (progress !== undefined && progress !== task.progress) {
      changes.push({ field: 'progress', old: task.progress, new: progress });
      task.progress = progress;
    }
    if (parentId !== undefined && parentId !== task.parentId?.toString()) {
      changes.push({ field: 'parentId', old: task.parentId, new: parentId });
      task.parentId = parentId;
    }

    await task.save();

    // Log activities
    for (const change of changes) {
      let description = `Updated ${change.field}`;
      if (change.field === 'assignedTo') {
        description = assignedTo ? 'Assigned task' : 'Unassigned task';
      } else if (change.field === 'status') {
        description = `Changed status to ${change.new}`;
      }
      await createActivity(task._id, req.user.id, 'updated', description, change.old, change.new);
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
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

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getSubtasks = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
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

    const subtasks = await Task.find({ parentId: req.params.id }).populate('assignedTo', 'name email');
    res.json(subtasks);
  } catch (error) {
    next(error);
  }
};
