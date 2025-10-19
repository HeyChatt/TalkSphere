
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Message, ChatPartner, User, UserActivity } from '../types';
import { useAuth } from './AuthContext';
import { getGeminiResponse } from '../services/geminiService';

interface ChatContextType {
  messages: Message[];
  activeChat: ChatPartner | null;
  setActiveChat: (partner: ChatPartner | null) => void;
  sendMessage: (text: string, receiverId: string) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, newText: string) => void;
  chatPartners: ChatPartner[];
  isBotTyping: boolean;
  userActivity: UserActivity;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const GEMINI_BOT: ChatPartner = {
  id: 'gemini-bot',
  username: 'Gemini Bot',
  avatar: 'https://i.imgur.com/2Y4aHqf.png'
};

const GLOBAL_CHAT: ChatPartner = {
  id: 'global',
  username: 'Global Chat',
  avatar: 'https://i.imgur.com/k2DPbZN.png'
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, users } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    const storedMessages = localStorage.getItem('chat-messages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  });
  const [activeChat, setActiveChat] = useState<ChatPartner | null>(GLOBAL_CHAT);
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [userActivity, setUserActivity] = useState<UserActivity>({});

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const otherUsers = users
      .filter(u => u.id !== currentUser?.id)
      .map(({ id, username, avatar }) => ({ id, username, avatar }));
    setChatPartners([GLOBAL_CHAT, GEMINI_BOT, ...otherUsers]);
  }, [users, currentUser]);

  // Write current user's activity
  useEffect(() => {
    if (currentUser && activeChat) {
        try {
            const activityData = JSON.parse(localStorage.getItem('chat-user-activity') || '{}');
            activityData[currentUser.id] = {
                activeChatId: activeChat.id,
                lastSeen: Date.now(),
            };
            localStorage.setItem('chat-user-activity', JSON.stringify(activityData));
        } catch (e) {
            console.error("Failed to write user activity", e);
        }
    }
  }, [activeChat, currentUser]);
  
  // "Live" chat simulation and activity polling from localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      // Poll Messages
      const storedMessages = localStorage.getItem('chat-messages');
      if (storedMessages) {
        try {
            const parsedMessages = JSON.parse(storedMessages) as Message[];
            if (JSON.stringify(parsedMessages) !== JSON.stringify(messages)) {
                setMessages(parsedMessages);
            }
        } catch (e) { console.error("Failed to parse messages", e); }
      }
      
      // Poll User Activity
      const storedActivity = localStorage.getItem('chat-user-activity');
      if (storedActivity) {
          try {
            const parsedActivity = JSON.parse(storedActivity) as UserActivity;
            setUserActivity(parsedActivity);
          } catch(e) { console.error("Failed to parse user activity", e); }
      }

    }, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [messages]);

  const sendMessage = useCallback(async (text: string, receiverId: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: Date.now(),
    };
    // Use a function with previous state to avoid race conditions with polling
    setMessages(prev => [...prev, newMessage]);

    if (receiverId === 'gemini-bot') {
      setIsBotTyping(true);
      const botResponseText = await getGeminiResponse(text, currentUser.id);
      setIsBotTyping(false);
      const botMessage: Message = {
        id: `msg_${Date.now()}_bot`,
        senderId: 'gemini-bot',
        receiverId: currentUser.id,
        text: botResponseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    }
  }, [currentUser]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const editMessage = useCallback((messageId: string, newText: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, text: newText, isEdited: true } : msg
      )
    );
  }, []);

  const value = {
    messages,
    activeChat,
    setActiveChat,
    sendMessage,
    deleteMessage,
    editMessage,
    chatPartners,
    isBotTyping,
    userActivity
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
