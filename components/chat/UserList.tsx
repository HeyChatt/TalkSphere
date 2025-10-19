
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatPartner } from '../../types';
import { LogOutIcon, EditIcon } from '../common/Icons';
import ProfileModal from './ProfileModal';

interface UserListProps {
    onUserSelect?: () => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const { chatPartners, activeChat, setActiveChat, userActivity } = useChat();
  const { currentUser, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSelectChat = (partner: ChatPartner) => {
    setActiveChat(partner);
    if(onUserSelect) {
        onUserSelect();
    }
  };

  const getPartnerStatus = (partner: ChatPartner): string | null => {
    if (partner.id === 'global' || partner.id === 'gemini-bot') return null;
    const activity = userActivity[partner.id];
    if (!activity) return null;

    const isOnline = Date.now() - activity.lastSeen < 15000; // Active in last 15s
    if (!isOnline) return null;

    if (activity.activeChatId === currentUser?.id) {
        return "In chat with you";
    }
    if (activity.activeChatId === 'global') {
        return "In Global Chat";
    }
    return "Online";
  };

  if (!currentUser) return null;

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 border-r border-gray-700">
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
            <img src={currentUser.avatar} alt={currentUser.username} className="w-10 h-10 rounded-full mr-3" />
            <h2 className="font-bold text-lg truncate">{currentUser.username}</h2>
        </div>
        <div>
            <button onClick={() => setIsProfileModalOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors"><EditIcon className="w-5 h-5"/></button>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition-colors"><LogOutIcon className="w-5 h-5"/></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatPartners.map(partner => {
          const status = getPartnerStatus(partner);
          const isOnline = !!status;
          return (
          <div
            key={partner.id}
            onClick={() => handleSelectChat(partner)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-colors ${activeChat?.id === partner.id ? 'bg-blue-900/50' : ''}`}
          >
            <div className="relative">
                <img src={partner.avatar} alt={partner.username} className="w-10 h-10 rounded-full mr-3" />
                {isOnline && partner.id !== 'global' && partner.id !== 'gemini-bot' && (
                    <span className="absolute bottom-0 right-3 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-gray-900"></span>
                )}
            </div>
            <div className="flex-1">
                <span className="font-medium">{partner.username}</span>
                {status && <p className="text-xs text-blue-300 truncate">{status}</p>}
            </div>
          </div>
        )})}
      </div>
      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </div>
  );
};

export default UserList;
