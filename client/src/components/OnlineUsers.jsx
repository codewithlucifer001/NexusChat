import React from 'react';
import { useChat } from '../context/ChatContext';
import { generateAvatar } from '../utils/helpers';

const OnlineUsers = () => {
  const { users, user: currentUser, setActivePrivateChatUserId } = useChat();

  const handleUserClick = (userId) => {
    if (userId !== currentUser.id) {
      setActivePrivateChatUserId(userId);
    }
  };

  return (
    <div className="hidden w-60 flex-shrink-0 flex-col bg-discord-dark p-4 lg:flex">
      <h3 className="mb-4 text-xs font-semibold uppercase text-discord-muted">
        Online — {users.length}
      </h3>
      <div className="flex-1 overflow-y-auto">
        {users.map((u) => (
          <button
            key={u.id}
            className={`mb-2 flex w-full items-center rounded p-2 text-left transition-colors duration-150 ${
              u.id === currentUser?.id
                ? 'cursor-default'
                : 'hover:bg-discord-hover'
            }`}
            onClick={() => handleUserClick(u.id)}
            disabled={u.id === currentUser?.id}
          >
            <div className="relative mr-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-discord-purple text-sm font-bold text-white"
                style={{ backgroundColor: `hsl(${u.username.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
              >
                {generateAvatar(u.username)}
              </div>
              <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-discord-dark bg-discord-green"></div>
            </div>
            <span
              className={`text-sm font-medium ${u.id === currentUser?.id ? 'text-discord-muted' : 'text-discord-text'}`}
            >
              {u.username} {u.id === currentUser?.id && '(You)'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;