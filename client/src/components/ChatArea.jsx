import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { formatMessageTimestamp, generateAvatar, isSameDay, formatDateSeparator } from '../utils/helpers';
import EmojiPicker from './EmojiPicker';

const ChatArea = () => {
  const {
    user,
    currentRoom,
    messages,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    rooms,
  } = useChat();
  const [messageContent, setMessageContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentRoomData = rooms.find((room) => room.id === currentRoom);
  const roomMessages = messages[currentRoom] || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (messageContent.trim()) {
      sendMessage(messageContent);
      setMessageContent('');
      stopTyping(); // Ensure typing stops after sending
      setShowEmojiPicker(false);
    }
  }, [messageContent, sendMessage, stopTyping]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e) => {
      setMessageContent(e.target.value);
      if (e.target.value.length > 0) {
        startTyping();
      } else {
        stopTyping();
      }
    },
    [startTyping, stopTyping]
  );

  const handleEmojiSelect = useCallback((emoji) => {
    setMessageContent((prev) => prev + emoji);
    inputRef.current?.focus();
    startTyping(); // Assume typing continues after emoji
  }, [startTyping]);

  const debouncedStopTyping = useRef(null);
  useEffect(() => {
    if (messageContent.length > 0) {
      if (debouncedStopTyping.current) {
        clearTimeout(debouncedStopTyping.current);
      }
      debouncedStopTyping.current = setTimeout(() => {
        stopTyping();
      }, 2000); // Stop typing after 2 seconds of inactivity
    } else {
      if (debouncedStopTyping.current) {
        clearTimeout(debouncedStopTyping.current);
      }
      stopTyping();
    }
    return () => {
      if (debouncedStopTyping.current) {
        clearTimeout(debouncedStopTyping.current);
      }
    };
  }, [messageContent, stopTyping]);

  const renderMessages = () => {
    let lastDate = null;
    return roomMessages.map((msg, index) => {
      const messageDate = new Date(msg.timestamp);
      const showDateSeparator = lastDate === null || !isSameDay(lastDate, messageDate);
      lastDate = messageDate;

      const isSystemMessage = msg.type === 'system';

      return (
        <React.Fragment key={msg.id}>
          {showDateSeparator && (
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-discord-muted opacity-20"></div>
              <span className="relative z-10 bg-discord-bg px-4 text-xs font-semibold uppercase text-discord-muted">
                {formatDateSeparator(msg.timestamp)}
              </span>
            </div>
          )}
          <div
            className={`group flex items-start p-2 hover:bg-discord-hover transition-colors duration-150 ${
              isSystemMessage ? 'italic text-discord-muted' : ''
            }`}
          >
            {!isSystemMessage && (
              <div
                className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-discord-purple text-lg font-bold text-white"
                style={{ backgroundColor: `hsl(${msg.username.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}
              >
                {msg.avatar}
              </div>
            )}
            <div className="flex-1">
              {!isSystemMessage && (
                <div className="flex items-baseline">
                  <span className="mr-2 font-semibold text-discord-text">
                    {msg.username}
                  </span>
                  <span className="text-xs text-discord-muted">
                    {formatMessageTimestamp(msg.timestamp)}
                  </span>
                </div>
              )}
              <p className="text-discord-text break-words whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const typingUsernames = typingUsers
    .filter((tu) => tu.roomId === currentRoom && tu.username !== user?.username)
    .map((tu) => tu.username);

  return (
    <div className="flex flex-1 flex-col bg-discord-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-discord-dark p-4 shadow-sm">
        <div className="flex items-center">
          <span className="mr-2 text-xl font-bold text-discord-muted">#</span>
          <h2 className="text-xl font-semibold text-discord-text">
            {currentRoomData?.name || 'General'}
          </h2>
          <p className="ml-4 text-sm text-discord-muted hidden md:block">
            {currentRoomData?.description || 'Start chatting!'}
          </p>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-discord-muted">
            {roomMessages.length} messages
          </span>
          {/* <button className="text-discord-muted hover:text-discord-text">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button> */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-0">
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsernames.length > 0 && (
        <div className="px-4 py-2 text-sm text-discord-muted">
          {typingUsernames.length === 1
            ? `${typingUsernames[0]} is typing`
            : `${typingUsernames.join(', ')} are typing`}
          <span className="animate-pulse">...</span>
        </div>
      )}

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
            placeholder={`Message #${currentRoomData?.name || 'general'}`}
            value={messageContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            maxLength={500}
            style={{ maxHeight: '100px' }} // Limit textarea height
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

export default ChatArea;