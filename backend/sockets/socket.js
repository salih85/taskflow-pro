const socketIO = require('socket.io');

exports.initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
    });

    socket.on('taskUpdated', (task) => {
      if (task.projectId) {
        io.to(task.projectId).emit('taskUpdated', task);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
