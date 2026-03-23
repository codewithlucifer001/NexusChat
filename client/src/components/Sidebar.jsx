import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { generateAvatar } from '../utils/helpers';

const Sidebar = () => {
  const { user, rooms, users, currentRoom, joinRoom, setActivePrivateChatUserId } = useChat();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoomClick = (roomId) => {
    joinRoom(roomId);
    setActivePrivateChatUserId(null); // Close private chat when joining a room
    setIsMobileMenuOpen(false);
  };

  const handlePrivateChatClick = (userId) => {
    setActivePrivateChatUserId(userId);
    setIsMobileMenuOpen(false);
  };

  const onlineUsersExcludingSelf = users.filter(u => u.id !== user?.id);

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="fixed left-4 top-4 z-50 block rounded bg-discord-sidebar p-2 text-discord-text lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Left Icon Bar */}
        <div className="flex w-16 flex-col items-center bg-discord-dark py-3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-discord-purple text-white">
            <img src="/nexuschat-logo.svg" alt="NexusChat Logo" className="h-8 w-8" />
          </div>
          <div className="my-2 h-0.5 w-8 rounded-full bg-discord-muted opacity-20"></div>
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-150 ${
                currentRoom === room.id
                  ? 'rounded-2xl bg-discord-purple'
                  : 'bg-discord-sidebar hover:rounded-2xl hover:bg-discord-purple'
              }`}
              onClick={() => handleRoomClick(room.id)}
              title={room.name}
            >
              {generateAvatar(room.name)}
            </button>
          ))}
          <div className="my-2 h-0.5 w-8 rounded-full bg-discord-muted opacity-20"></div>
          <button
            className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-discord-sidebar text-discord-green hover:rounded-2xl hover:bg-discord-green hover:text-white transition-all duration-150"
            title="Direct Messages"
            onClick={() => {
              // Maybe open a DM list or a search for DMs
              // For now, just close mobile menu
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          {/* Settings icon at bottom */}
          <div className="mt-auto">
            <button
              className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-discord-sidebar text-discord-muted hover:rounded-2xl hover:bg-discord-hover hover:text-discord-text transition-all duration-150"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Rooms Panel */}
        <div className="flex w-60 flex-shrink-0 flex-col bg-discord-sidebar">
          <div className="flex h-12 items-center border-b border-discord-dark px-4 shadow-sm">
            <h2 className="text-md font-bold text-discord-text">NEXUSCHAT</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* Search Rooms - Placeholder for now */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Find or start a conversation"
                className="w-full rounded bg-[#40444b] px-2 py-1 text-sm text-discord-text placeholder-discord-muted focus:outline-none"
              />
            </div>

            {/* Text Channels */}
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-discord-muted">
              Text Channels
            </h3>
            {rooms.map((room) => (
              <button
                key={room.id}
                className={`mb-1 flex w-full items-center rounded p-2 text-left transition-colors duration-150 ${
                  currentRoom === room.id
                    ? 'bg-discord-hover text-discord-text'
                    : 'text-discord-muted hover:bg-discord-hover hover:text-discord-text'
                }`}
                onClick={() => handleRoomClick(room.id)}
              >
                <span className="mr-2 text-lg font-bold">#</span>
                <span className="text-sm font-medium">{room.name}</span>
              </button>
            ))}

            {/* Direct Messages */}
            <h3 className="mb-2 mt-4 px-2 text-xs font-semibold uppercase text-discord-muted">
              Direct Messages
            </h3>
            {onlineUsersExcludingSelf.map((u) => (
              <button
                key={u.id}
                className="mb-1 flex w-full items-center rounded p-2 text-left text-discord-muted transition-colors duration-150 hover:bg-discord-hover hover:text-discord-text"
                onClick={() => handlePrivateChatClick(u.id)}
              >
                <div className="relative mr-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-discord-purple text-xs font-bold text-white"
                    style={{ backgroundColor: `hsl(${u.username.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
                  >
                    {generateAvatar(u.username)}
                  </div>
                  <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-discord-sidebar bg-discord-green"></div>
                </div>
                <span className="text-sm font-medium">{u.username}</span>
              </button>
            ))}
          </div>

          {/* User Panel */}
          {user && (
            <div className="flex items-center justify-between bg-discord-dark p-2">
              <div className="flex items-center">
                <div
                  className="relative mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-discord-purple text-sm font-bold text-white"
                  style={{ backgroundColor: `hsl(${user.username.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
                >
                  {user.avatar}
                  <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-discord-dark bg-discord-green"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-discord-text">
                    {user.username}
                  </p>
                  <p className="text-xs text-discord-green">Online</p>
                </div>
              </div>
              {/* Settings icon */}
              <button className="text-discord-muted hover:text-discord-text">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.16-1.87-1.16-2.25 0a1.58 1.58 0 01-1.45 1.06A1.58 1.58 0 005.16 5.49c-1.16.38-1.16 1.87 0 2.25a1.58 1.58 0 011.06 1.45c.38 1.16 1.87 1.16 2.25 0a1.58 1.58 0 011.45-1.06 1.58 1.58 0 001.06-1.45c.38-1.16 1.87-1.16 2.25 0a1.58 1.58 0 011.45 1.06 1.58 1.58 0 001.06 1.45c1.16.38 1.16 1.87 0 2.25a1.58 1.58 0 01-1.06 1.45c-.38 1.16-1.87 1.16-2.25 0a1.58 1.58 0 01-1.45-1.06 1.58 1.58 0 00-1.06-1.45c-1.16-.38-1.16-1.87 0-2.25a1.58 1.58 0 011.06-1.45c.38-1.16-1.87-1.16-2.25 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10 10a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;