import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // All online users
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState({}); // { roomId: [messages] }
  const [privateMessages, setPrivateMessages] = useState({}); // { conversationKey: [messages] }
  const [typingUsers, setTypingUsers] = useState([]); // [{ username, roomId }]
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]); // [{ type, message }]
  const [error, setError] = useState(null);
  const [activePrivateChatUserId, setActivePrivateChatUserId] = useState(null);

  const socketRef = useRef(null);

  // --- Socket Connection and Event Listeners ---
  const joinChat = useCallback((username) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io('http://localhost:3001');
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
      setIsConnected(true);
      newSocket.emit('user:join', { username });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
      setIsConnected(false);
      setUser(null);
      setUsers([]);
      setRooms([]);
      setMessages({});
      setPrivateMessages({});
      setTypingUsers([]);
      setCurrentRoom('general');
      setActivePrivateChatUserId(null);
      addNotification({ type: 'system', message: 'You have been disconnected.' });
    });

    newSocket.on('user:joined', (data) => {
      setUser(data.user);
      setRooms(data.rooms);
      setCurrentRoom(data.user.currentRoom);
      setError(null); // Clear any previous errors
    });

    newSocket.on('rooms:list', (data) => {
      setRooms(data);
    });

    newSocket.on('users:online', (data) => {
      setUsers(data);
    });

    newSocket.on('messages:history', ({ roomId, messages: historyMessages }) => {
      setMessages((prev) => ({
        ...prev,
        [roomId]: historyMessages,
      }));
    });

    newSocket.on('message:received', (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.roomId]: [...(prev[message.roomId] || []), message],
      }));
    });

    newSocket.on('private:received', (message) => {
      const conversationKey = [message.fromId, message.toId].sort().join('-');
      setPrivateMessages((prev) => ({
        ...prev,
        [conversationKey]: [...(prev[conversationKey] || []), message],
      }));
      // If the message is for the current user and not from them, and private chat is not active, show notification
      if (message.toId === user?.id && message.fromId !== user?.id && activePrivateChatUserId !== message.fromId) {
        addNotification({ type: 'private', message: `New private message from ${message.fromUsername}` });
      }
    });

    newSocket.on('typing:update', ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.some((u) => u.username === username)) {
            return [...prev, { username, roomId: currentRoom }]; // Assuming typing is for current room
          }
        } else {
          return prev.filter((u) => u.username !== username);
        }
        return prev;
      });
    });

    newSocket.on('user:connected', ({ username }) => {
      addNotification({ type: 'user:connected', message: `${username} joined the chat.` });
    });

    newSocket.on('user:disconnected', ({ username }) => {
      addNotification({ type: 'user:disconnected', message: `${username} left the chat.` });
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
      addNotification({ type: 'error', message: err.message });
    });

    newSocket.on('room:joined', ({ roomId }) => {
      setCurrentRoom(roomId);
      // Request message history for the new room
      newSocket.emit('messages:history', { roomId });
    });

    newSocket.on('user:joined:room', ({ username }) => {
      // This is handled by the server sending a system message or a notification
      // For now, let's just log it or add a notification if needed
      console.log(`${username} joined this room.`);
    });

  }, [currentRoom, user?.id, activePrivateChatUserId]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // --- Helper for Notifications ---
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  // --- Chat Actions ---
  const sendMessage = useCallback(
    (content) => {
      if (socket && user && content.trim()) {
        socket.emit('message:send', { roomId: currentRoom, content });
      }
    },
    [socket, user, currentRoom]
  );

  const joinRoom = useCallback(
    (roomId) => {
      if (socket && user && roomId !== currentRoom) {
        socket.emit('room:join', { roomId });
      }
    },
    [socket, user, currentRoom]
  );

  const sendPrivateMessage = useCallback(
    (toUserId, content) => {
      if (socket && user && toUserId && content.trim()) {
        socket.emit('private:send', { toUserId, content });
      }
    },
    [socket, user]
  );

  const startTyping = useCallback(() => {
    if (socket && user) {
      socket.emit('typing:start', { roomId: currentRoom });
    }
  }, [socket, user, currentRoom]);

  const stopTyping = useCallback(() => {
    if (socket && user) {
      socket.emit('typing:stop', { roomId: currentRoom });
    }
  }, [socket, user, currentRoom]);

  const value = {
    socket,
    user,
    users,
    rooms,
    currentRoom,
    messages,
    privateMessages,
    typingUsers,
    isConnected,
    notifications,
    error,
    activePrivateChatUserId,
    setNotifications, // Allow Notification component to clear notifications
    setActivePrivateChatUserId,
    joinChat,
    sendMessage,
    joinRoom,
    sendPrivateMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};