
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { SendIcon } from '../common/Icons';

const MessageInput: React.FC = () => {
  const [text, setText] = useState('');
  const { sendMessage, activeChat } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && activeChat) {
      sendMessage(text.trim(), activeChat.id);
      setText('');
    }
  };

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!activeChat}
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          disabled={!text.trim() || !activeChat}
        >
          <SendIcon className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
