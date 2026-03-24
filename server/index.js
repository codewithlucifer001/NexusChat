import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// --- CHANGE 1: Added global CORS middleware to prevent browser blocking ---
app.use(cors()); 

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows connections from any frontend URL (like GitHub Pages)
    methods: ["GET", "POST"]
  }
});

const rooms = [
  { id: 'general', name: 'General', description: 'General discussion' }
];
const users = new Map();
const messages = new Map();
messages.set('general', []);
const privateMessages = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user:join', ({ username }) => {
    const isUsernameTaken = [...users.values()].some(user => user.username === username);
    if (isUsernameTaken) {
      socket.emit('error', { message: 'Username already taken' });
      return;
    }

    const user = {
      id: socket.id,
      username,
      currentRoom: 'general',
      avatar: username.charAt(0).toUpperCase()
    };
    users.set(socket.id, user);
    socket.join('general');

    socket.emit('user:joined', { user, rooms });
    io.emit('rooms:list', rooms);
    io.emit('users:online', Array.from(users.values()));
    socket.broadcast.emit('user:connected', { username });

    const roomMessages = messages.get('general') || [];
    socket.emit('messages:history', { roomId: 'general', messages: roomMessages.slice(-50) });
  });

  socket.on('room:join', ({ roomId }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.leave(user.currentRoom);
      socket.join(roomId);
      user.currentRoom = roomId;
      users.set(socket.id, user);

      socket.emit('room:joined', { roomId });
      const roomMessages = messages.get(roomId) || [];
      socket.emit('messages:history', { roomId, messages: roomMessages });
      socket.to(roomId).emit('user:joined:room', { username: user.username });
      io.emit('users:online', Array.from(users.values()));
    }
  });

  socket.on('message:send', ({ roomId, content }) => {
    const user = users.get(socket.id);
    if (user && content.trim() !== '' && content.length <= 500) {
      const message = {
        id: Date.now().toString(),
        userId: socket.id,
        username: user.username,
        avatar: user.avatar,
        content,
        roomId,
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      if (!messages.has(roomId)) {
        messages.set(roomId, []);
      }
      const roomMessages = messages.get(roomId);
      roomMessages.push(message);
      messages.set(roomId, roomMessages.slice(-100));

      io.to(roomId).emit('message:received', message);
    }
  });

  socket.on('private:send', ({ toUserId, content }) => {
    const sender = users.get(socket.id);
    const receiver = users.get(toUserId);
    if (sender && receiver && content.trim() !== '') {
      const message = {
        id: Date.now().toString(),
        fromId: socket.id,
        fromUsername: sender.username,
        toId: toUserId,
        toUsername: receiver.username,
        content,
        timestamp: new Date().toISOString()
      };

      const conversationKey = [socket.id, toUserId].sort().join('-');
      if (!privateMessages.has(conversationKey)) {
        privateMessages.set(conversationKey, []);
      }
      const conversation = privateMessages.get(conversationKey);
      conversation.push(message);

      io.to(socket.id).to(toUserId).emit('private:received', message);
    }
  });

  socket.on('typing:start', ({ roomId }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(roomId).emit('typing:update', { username: user.username, isTyping: true });
    }
  });

  socket.on('typing:stop', ({ roomId }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(roomId).emit('typing:update', { username: user.username, isTyping: false });
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      socket.broadcast.emit('user:disconnected', { username: user.username });
      io.emit('users:online', Array.from(users.values()));
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- CHANGE 2: Using process.env.PORT for Railway compatibility ---
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`NexusChat server running on port ${PORT}`);
});