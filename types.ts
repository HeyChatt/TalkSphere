
export interface User {
  id: string;
  username: string;
  passwordHash: string; 
  avatar: string; 
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // 'global', a userId, or 'gemini-bot'
  text: string;
  timestamp: number;
  isEdited?: boolean;
}

export type ChatPartner = {
  id: string;
  username: string;
  avatar: string;
};

export interface UserActivity {
  [userId: string]: {
    activeChatId: string;
    lastSeen: number;
  };
}
