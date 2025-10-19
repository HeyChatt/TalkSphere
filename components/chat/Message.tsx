
import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType } from '../../types';
import { useChat } from '../../contexts/ChatContext';
import { EditIcon, TrashIcon, MoreVerticalIcon } from '../common/Icons';

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  senderName?: string;
  senderAvatar: string;
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage, senderName, senderAvatar }) => {
  const { deleteMessage, editMessage } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (editedText.trim()) {
      editMessage(message.id, editedText.trim());
      setIsEditing(false);
      setShowMenu(false);
    }
  };

  const handleDelete = () => {
    deleteMessage(message.id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const messageClasses = isOwnMessage
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-700 text-gray-200 rounded-bl-none';
  
  const containerClasses = `flex items-end gap-2 my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`;

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col w-full">
            <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit();} }}
                className="w-full p-2 text-sm bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
            />
            <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleEdit} className="text-xs text-blue-400 hover:text-blue-300">Save</button>
            </div>
        </div>
      );
    }
    return (
      <div className="group flex items-center relative">
        <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md break-words ${messageClasses}`}>
          {senderName && <p className="text-xs font-bold text-blue-300 mb-1">{senderName}</p>}
          <p className="text-sm">{message.text}</p>
          <div className="text-right text-xs text-gray-300/70 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {message.isEdited && <span className="ml-1">(edited)</span>}
          </div>
        </div>
        {isOwnMessage && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="ml-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            {showMenu && (
              <div ref={menuRef} className="absolute right-0 bottom-6 w-28 bg-gray-900 rounded-md shadow-lg z-10 border border-gray-700">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full flex items-center px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-700">
                  <EditIcon className="w-4 h-4 mr-2" /> Edit
                </button>
                <button onClick={handleDelete} className="w-full flex items-center px-3 py-2 text-sm text-left text-red-400 hover:bg-gray-700">
                  <TrashIcon className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={containerClasses}>
      {!isOwnMessage && <img src={senderAvatar} alt="avatar" className="w-8 h-8 rounded-full"/>}
      {renderMessageContent()}
      {isOwnMessage && <img src={senderAvatar} alt="avatar" className="w-8 h-8 rounded-full"/>}
    </div>
  );
};

export default Message;
