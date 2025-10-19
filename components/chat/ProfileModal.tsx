
import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CloseIcon } from '../common/Icons';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, updateUser, users } = useAuth();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setError('');
    setSuccess('');
    if (username.trim() === '') {
        setError('Username cannot be empty.');
        return;
    }
    if (users.some(u => u.username === username && u.id !== currentUser.id)) {
        setError('Username is already taken.');
        return;
    }

    updateUser(currentUser.id, { username, avatar });
    setSuccess('Profile updated successfully!');
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-sm m-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

        <div className="flex flex-col items-center mb-6">
          <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4" />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            Change Photo
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mt-4">{success}</p>}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
