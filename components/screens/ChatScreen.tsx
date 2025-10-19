
import React, { useState } from 'react';
import UserList from '../chat/UserList';
import ChatWindow from '../chat/ChatWindow';
import { MenuIcon, CloseIcon } from '../common/Icons';

const ChatScreen: React.FC = () => {
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800 text-gray-100">
       <div className="md:hidden p-2 bg-gray-900 shadow-md flex items-center">
         <button onClick={() => setIsUserListOpen(!isUserListOpen)} className="p-2">
            {isUserListOpen ? <CloseIcon className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
         </button>
         <h1 className="text-xl font-bold ml-4">Gemini Chat</h1>
       </div>
       <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-20 transform ${isUserListOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
            <UserList onUserSelect={() => setIsUserListOpen(false)}/>
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-1/3 max-w-xs">
            <UserList />
        </div>

        <div className="flex-1 flex flex-col">
            <ChatWindow />
        </div>
       </div>
    </div>
  );
};

export default ChatScreen;
