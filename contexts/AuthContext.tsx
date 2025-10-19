
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  signup: (username: string, password: string) => Promise<User>;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple hashing function for demonstration. 
// In a real app, use a robust library like bcrypt.
const simpleHash = (s: string): string => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return hash.toString();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('chat-users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const storedUser = sessionStorage.getItem('chat-current-user');
      return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('chat-users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    if (currentUser) {
        sessionStorage.setItem('chat-current-user', JSON.stringify(currentUser));
    } else {
        sessionStorage.removeItem('chat-current-user');
    }
  }, [currentUser]);


  const signup = async (username: string, password: string): Promise<User> => {
    if (users.find(u => u.username === username)) {
      throw new Error("Username already exists");
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      passwordHash: simpleHash(password),
      avatar: `https://picsum.photos/seed/${Math.random()}/200`
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    const user = users.find(u => u.username === username);
    if (user && user.passwordHash === simpleHash(password)) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prevUsers =>
      prevUsers.map(user => (user.id === userId ? { ...user, ...updates } : user))
    );
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const value = { currentUser, users, signup, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
