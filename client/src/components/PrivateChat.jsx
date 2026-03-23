import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { formatMessageTimestamp, generateAvatar, isSameDay, formatDateSeparator } from '../utils/helpers';
import EmojiPicker from './EmojiPicker';

const PrivateChat = () => {
  const {
    user: currentUser,
    users,
    privateMessages,
    activePrivateChatUserId,
    setActivePrivateChatUserId,
    sendPrivateMessage,
  } = useChat();
  const [messageContent, setMessageContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const receiver = users.find((u) => u.id === activePrivateChatUserId);

  const conversationKey = activePrivateChatUserId
    ? [currentUser.id, activePrivateChatUserId].sort().join('-')
    : null;
  const currentPrivateMessages = conversationKey
    ? privateMessages[conversationKey] || []
    : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentPrivateMessages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (messageContent.trim() && activePrivateChatUserId) {
      sendPrivateMessage(activePrivateChatUserId, messageContent);
      setMessageContent('');
      setShowEmojiPicker(false);
    }
  }, [messageContent, activePrivateChatUserId, sendPrivateMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleEmojiSelect = useCallback((emoji) => {
    setMessageContent((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  if (!activePrivateChatUserId || !receiver) {
    return null; // Don't render if no private chat is active
  }

  const renderMessages = () => {
    let lastDate = null;
    return currentPrivateMessages.map((msg, index) => {
      const messageDate = new Date(msg.timestamp);
      const showDateSeparator = lastDate === null || !isSameDay(lastDate, messageDate);
      lastDate = messageDate;

      const isSender = msg.fromId === currentUser.id;
      const senderUsername = isSender ? currentUser.username : receiver.username;
      const senderAvatar = isSender ? currentUser.avatar : receiver.avatar;

      return (
        <React.Fragment key={msg.id}>
          {showDateSeparator && (
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-discord-muted opacity-20"></div>
              <span className="relative z-10 bg-discord-sidebar px-4 text-xs font-semibold uppercase text-discord-muted">
                {formatDateSeparator(msg.timestamp)}
              </span>
            </div>
          )}
          <div className="group flex items-start p-2 hover:bg-discord-hover transition-colors duration-150">
            <div
              className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-discord-purple text-lg font-bold text-white"
              style={{ backgroundColor: `hsl(${senderUsername.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
            >
              {senderAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="mr-2 font-semibold text-discord-text">
                  {senderUsername}
                </span>
                <span className="text-xs text-discord-muted">
                  {formatMessageTimestamp(msg.timestamp)}
                </span>
              </div>
              <p className="text-discord-text break-words whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col bg-discord-sidebar shadow-lg transition-transform duration-300 ease-out md:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-discord-dark p-4 shadow-sm">
        <div className="flex items-center">
          <div
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-discord-purple text-sm font-bold text-white"
            style={{ backgroundColor: `hsl(${receiver.username.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
          >
            {receiver.avatar}
          </div>
          <h2 className="text-lg font-semibold text-discord-text">
            {receiver.username}
          </h2>
        </div>
        <button
          className="text-discord-muted hover:text-discord-text"
          onClick={() => setActivePrivateChatUserId(null)}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-0">
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="relative p-4">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          </div>
        )}
        <div className="flex items-center rounded-lg bg-[#40444b] p-2">
          <button
            className="mr-2 text-discord-muted hover:text-discord-text"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <textarea
            ref={inputRef}
            className="flex-1 resize-none overflow-hidden bg-transparent text-discord-text placeholder-discord-muted focus:outline-none"
            rows="1"
            placeholder={`Message @${receiver.username}`}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            style={{ maxHeight: '100px' }}
          />
          <button
            className="ml-2 rounded bg-discord-purple px-4 py-2 text-white hover:bg-discord-purple/90 transition-colors duration-150"
            onClick={handleSendMessage}
            disabled={!messageContent.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateChat;