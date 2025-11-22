import React from 'react';
import { UserProfile } from '../../types';
import { Video } from 'lucide-react';

interface UserCardProps {
  user: UserProfile;
  onCall: (user: UserProfile) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onCall }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const isCallEnabled = user.status === 'available';

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-bold">
            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
        </div>
        
        <div>
          <h4 className="text-base font-medium text-gray-900">{user.displayName}</h4>
          <p className="text-sm text-gray-500">
            {user.role === 'facility' ? user.facilityId : user.role}
          </p>
        </div>
      </div>

      <button
        onClick={() => onCall(user)}
        disabled={!isCallEnabled}
        className={`p-2 rounded-full ${
          isCallEnabled 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={isCallEnabled ? "Start Video Call" : "User Unavailable"}
      >
        <Video className="w-6 h-6" />
      </button>
    </div>
  );
};

