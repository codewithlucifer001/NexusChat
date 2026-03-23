import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';

const Notification = () => {
  const { notifications, setNotifications } = useChat();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1)); // Remove the oldest notification
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notifications, setNotifications]);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col items-end space-y-2">
      {notifications.map((notification, index) => (
        <NotificationItem key={index} notification={notification} />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true);
  }, []);

  const bgColor =
    notification.type === 'user:connected'
      ? 'bg-discord-green'
      : notification.type === 'user:disconnected'
      ? 'bg-red-500' // Using a standard red for disconnect
      : 'bg-blue-500'; // Default for other types

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }
        flex items-center rounded-md p-3 text-white shadow-lg ${bgColor}`}
      style={{ minWidth: '250px' }}
    >
      {notification.type === 'user:connected' && (
        <span className="mr-2 text-lg">👋</span>
      )}
      {notification.type === 'user:disconnected' && (
        <span className="mr-2 text-lg">👋</span>
      )}
      <p className="text-sm font-medium">{notification.message}</p>
    </div>
  );
};

export default Notification;