import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../hooks/usePresence'; // Import presence hook
import { LogOut, Users, History, Settings, Shield } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize presence tracking for current user
  usePresence(currentUser?.uid);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center px-4 py-2 rounded-md ${
          isActive 
            ? 'bg-gray-100 text-gray-900 font-medium' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {children}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Total Relief</h1>
          <p className="text-xs text-gray-500">Video Supervision</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/dashboard" icon={Users}>Roster</NavItem>
          <NavItem to="/history" icon={History}>Call History</NavItem>
          <NavItem to="/settings" icon={Settings}>Settings</NavItem>
          
          {isAdmin && (
            <NavItem to="/admin" icon={Shield}>Admin Panel</NavItem>
          )}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate w-32">{currentUser?.email}</p>
              <p className="text-xs text-green-500">● Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header Placeholder */}
      <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-white shadow flex items-center px-4 justify-between">
          <h1 className="text-lg font-bold">Total Relief</h1>
          <button onClick={handleLogout} className="text-gray-500">
            <LogOut className="w-5 h-5" />
          </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
};
