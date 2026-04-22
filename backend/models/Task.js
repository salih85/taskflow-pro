const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  labels: [{
    type: String,
    trim: true,
  }],
  attachments: [{
    type: String, // URLs or file paths
  }],
  timeEstimate: {
    type: Number, // in hours
  },
  timeSpent: {
    type: Number, // in hours
    default: 0,
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  progress: {
    type: Number, // percentage 0-100
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
