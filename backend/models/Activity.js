const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'assigned', 'status_changed', 'commented'],
  },
  description: {
    type: String,
    required: true,
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);