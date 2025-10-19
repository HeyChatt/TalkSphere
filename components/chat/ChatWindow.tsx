
import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { ChatPartner } from '../../types';

const ChatHeader: React.FC<{ activeChat: ChatPartner | null }> = ({ activeChat }) => {
    const { userActivity } = useChat();
    const { currentUser } = useAuth();
    
    const getStatus = (): string | null => {
        if (!activeChat || !currentUser || activeChat.id === 'global' || activeChat.id === 'gemini-bot') return null;

        const activity = userActivity[activeChat.id];
        if (!activity) return null;

        const isOnline = Date.now() - activity.lastSeen < 15000;
        if (!isOnline) return null;

        return activity.activeChatId === currentUser.id ? "Active now" : "Online";
    };

    const status = getStatus();

    return (
        <div className="p-4 flex items-center bg-gray-900 border-b border-gray-700 shadow-md">
        {activeChat && (
            <>
            <img src={activeChat.avatar} alt={activeChat.username} className="w-10 h-10 rounded-full mr-4" />
            <div>
                <h2 className="text-xl font-bold">{activeChat.username}</h2>
                {status && <p className="text-xs text-green-400">{status}</p>}
            </div>
            </>
        )}
        </div>
    );
};

const ChatWindow: React.FC = () => {
  const { messages, activeChat, isBotTyping } = useChat();
  const { currentUser, users } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  if (!activeChat || !currentUser) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <p>Select a chat to start messaging</p>
        </div>
    );
  }

  const getSenderName = (senderId: string) => {
    if (senderId === 'gemini-bot') return 'Gemini Bot';
    const sender = users.find(u => u.id === senderId);
    return sender?.username || 'Unknown User';
  }
  
  const getSenderAvatar = (senderId: string) => {
    if (senderId === 'gemini-bot') return 'https://i.imgur.com/2Y4aHqf.png';
    const sender = users.find(u => u.id === senderId);
    return sender?.avatar || 'https://picsum.photos/seed/default/200';
  }

  const filteredMessages = messages.filter(msg => {
    if (activeChat.id === 'global') return msg.receiverId === 'global';
    return (
      (msg.senderId === currentUser.id && msg.receiverId === activeChat.id) ||
      (msg.senderId === activeChat.id && msg.receiverId === currentUser.id)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
        <div className="hidden md:block">
            <ChatHeader activeChat={activeChat} />
        </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredMessages.map(message => (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUser.id}
            senderName={activeChat.id === 'global' ? getSenderName(message.senderId) : undefined}
            senderAvatar={getSenderAvatar(message.senderId)}
          />
        ))}
        {isBotTyping && activeChat.id === 'gemini-bot' && (
            <div className="flex items-center space-x-2 my-2">
                <img src={activeChat.avatar} alt="bot" className="w-8 h-8 rounded-full" />
                <div className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-gray-700">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
