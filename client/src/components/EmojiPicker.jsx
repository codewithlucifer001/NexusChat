import React, { useRef, useEffect } from 'react';

const emojis = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😅', '😭',
  '❤️', '👍', '👎', '🔥', '✅', '❌', '🎉', '💯',
  '👋', '🙏', '💪', '🤝', '👀', '💀', '🤣', '😊',
];

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-discord-purple bg-discord-dark p-2 shadow-lg"
      style={{ transformOrigin: 'bottom left' }}
    >
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-discord-hover text-xl transition-colors duration-150"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose(); // Close after selecting an emoji
            }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="absolute bottom-0 left-4 h-4 w-4 -translate-x-1/2 translate-y-1/2 rotate-45 transform bg-discord-dark border-b border-r border-discord-purple"></div>
    </div>
  );
};

export default EmojiPicker;