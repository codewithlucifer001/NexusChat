import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import OnlineUsers from '../components/OnlineUsers';
import Notification from '../components/Notification';
import PrivateChat from '../components/PrivateChat';
import { useChat } from '../context/ChatContext';

const ChatPage = () => {
  const { activePrivateChatUserId } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-discord-bg text-discord-text">
      <Sidebar />
      <ChatArea />
      <OnlineUsers />
      <Notification />
      {activePrivateChatUserId && <PrivateChat />}
    </div>
  );
};

export default ChatPage;