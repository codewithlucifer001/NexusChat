import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const { joinChat, user, error } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateUsername(username)) {
      joinChat(username);
    } else {
      // Display a local validation error if needed
      // For now, relying on backend 'username taken' error
    }
  };

  const validateUsername = (name) => {
    return name.length >= 3 && name.length <= 20 && !name.includes(' ');
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-discord-dark">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-br from-discord-purple to-discord-green opacity-20 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md rounded-lg bg-discord-sidebar p-8 shadow-2xl animate-fade-in">
        <div className="mb-6 flex flex-col items-center">
          <img src="/nexuschat-logo.svg" alt="NexusChat Logo" className="mb-4 h-16 w-16" />
          <h1 className="text-3xl font-bold text-discord-text">
            Welcome to NexusChat
          </h1>
          <p className="text-md text-discord-muted">
            Real-time chat for everyone
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-discord-muted"
            >
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              className="w-full rounded-md border border-transparent bg-[#40444b] p-3 text-discord-text placeholder-discord-muted focus:border-discord-purple focus:outline-none"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              required
            />
            {!validateUsername(username) && username.length > 0 && (
              <p className="mt-1 text-xs text-red-400">
                Username must be 3-20 characters and contain no spaces.
              </p>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-discord-purple p-3 font-semibold text-white transition-colors duration-200 hover:bg-discord-purple/90"
            disabled={!validateUsername(username)}
          >
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;