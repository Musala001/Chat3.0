const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Route for home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Room management
const rooms = new Set(['general', 'random']);

io.on('connection', (socket) => {
  console.log('New user connected');

  // Set username
  socket.on('set username', (username) => {
    const oldUsername = socket.username || 'Anonymous';
    socket.username = username;

    io.emit('user joined', {
      oldUsername,
      newUsername: username,
    });
  });

  // Join room
  socket.on('join room', (room) => {
    for (const r of socket.rooms) {
      if (r !== socket.id) {
        socket.leave(r);
        socket.emit('left room', r);
      }
    }

    socket.join(room);
    socket.emit('joined room', room);

    socket.to(room).emit('room message', {
      username: 'System',
      message: `${socket.username || 'Anonymous'} has joined the room`,
      timestamp: new Date().toISOString()
    });
  });

  // Create room
  socket.on('create room', (roomName) => {
    if (!rooms.has(roomName)) {
      rooms.add(roomName);
      io.emit('room created', roomName);
    }
  });

  // Handle messages
  socket.on('chat message', (data) => {
    const room = Array.from(socket.rooms).find(r => r !== socket.id) || 'general';
    const message = typeof data === 'string' ? data : data.message;

    io.to(room).emit('chat message', {
      username: socket.username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
      room
    });
  });

  // Notify others when user disconnects
  socket.on('disconnect', () => {
    io.emit('user left', {
      username: socket.username || 'Anonymous'
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
