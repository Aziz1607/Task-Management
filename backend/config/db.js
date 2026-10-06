const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_management_db';

  try {
    // Attempt connecting to the configured URI with a 3-second timeout for quick fallback
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to local/specified MongoDB at ${uri}: ${error.message}`);
    console.log(`[MongoDB] Attempting to start in-memory MongoDB instance for development...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const memoryConn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-memory MongoDB connected: ${memoryConn.connection.host}`);
      console.log(`[MongoDB] Tip: Set MONGODB_URI in backend/.env to connect to your persistent MongoDB instance.`);

      // Seed initial sample tasks so the user sees a rich UI immediately
      const Task = require('../models/Task');
      const count = await Task.countDocuments();
      if (count === 0) {
        await Task.create([
          {
            title: 'Design Angular components & pages',
            description: 'Implement TaskCard, TaskFilter, TaskForm, and Navbar in Angular 19',
            status: 'completed',
            completed: true,
            priority: 'high',
            dueDate: new Date(Date.now() - 86400000 * 2),
          },
          {
            title: 'Build Express.js REST API',
            description: 'Implement GET, POST, PUT, DELETE endpoints with Mongoose and validation',
            status: 'completed',
            completed: true,
            priority: 'high',
            dueDate: new Date(Date.now() - 86400000),
          },
          {
            title: 'Test status filtering and task completion',
            description: 'Verify toggle completion and filter by pending, in-progress, completed',
            status: 'in-progress',
            completed: false,
            priority: 'medium',
            dueDate: new Date(Date.now() + 86400000 * 3),
          },
          {
            title: 'Deploy Task Management App',
            description: 'Set up production build and environment configuration',
            status: 'pending',
            completed: false,
            priority: 'low',
            dueDate: new Date(Date.now() + 86400000 * 7),
          },
        ]);
        console.log('[MongoDB] Seeded sample tasks into in-memory database');
      }
    } catch (memErr) {
      console.error(`[MongoDB] Failed to start in-memory MongoDB: ${memErr.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
