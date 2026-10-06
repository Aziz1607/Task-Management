const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status (allowed: pending, in-progress, completed)',
      },
      default: 'pending',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority (allowed: low, medium, high)',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to synchronize 'completed' and 'status'
taskSchema.pre('save', function (next) {
  if (this.isModified('completed') && !this.isModified('status')) {
    this.status = this.completed ? 'completed' : 'pending';
  } else if (this.isModified('status') && !this.isModified('completed')) {
    this.completed = this.status === 'completed';
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

