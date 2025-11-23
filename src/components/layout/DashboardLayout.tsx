import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../hooks/usePresence';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { LogOut, Users, History, Settings, Shield, Menu, X, HelpCircle, Download } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isInstallable, install } = usePWAInstall();
  
  // Initialize presence tracking for current user
  usePresence(currentUser?.uid);

  const handleLogout = async () => {
    try {
      // Explicitly set status to offline in RTDB before signing out
      // This is redundant to onDisconnect but faster/cleaner
      if (currentUser?.uid) {
          const { ref, set, serverTimestamp } = await import('firebase/database');
          const { rtdb } = await import('../../config/firebase');
          await set(ref(rtdb, '/status/' + currentUser.uid), {
              state: 'offline',
              last_changed: serverTimestamp(),
          });
      }
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
        onClick={() => setIsSidebarOpen(false)}
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
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white shadow-md flex-col hidden md:flex">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Total Relief</h1>
          <p className="text-xs text-gray-500">Video Supervision</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/dashboard" icon={Users}>Roster</NavItem>
          <NavItem to="/history" icon={History}>Call History</NavItem>
          <NavItem to="/settings" icon={Settings}>Settings</NavItem>
          <NavItem to="/help" icon={HelpCircle}>Help & FAQ</NavItem>
          
          {isAdmin && (
            <NavItem to="/admin" icon={Shield}>Admin Panel</NavItem>
          )}
          
          {isInstallable && (
            <button
              onClick={install}
              className="flex w-full items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <Download className="w-5 h-5 mr-3" />
              Install App
            </button>
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

      {/* Mobile Sidebar (Overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
          
          {/* Sidebar Content */}
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg flex flex-col z-50">
            <div className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Total Relief</h1>
                    <p className="text-xs text-gray-500">Video Supervision</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavItem to="/dashboard" icon={Users}>Roster</NavItem>
              <NavItem to="/history" icon={History}>Call History</NavItem>
              <NavItem to="/settings" icon={Settings}>Settings</NavItem>
              <NavItem to="/help" icon={HelpCircle}>Help & FAQ</NavItem>
              
              {isAdmin && (
                <NavItem to="/admin" icon={Shield}>Admin Panel</NavItem>
              )}

              {isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setIsSidebarOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Install App
                </button>
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
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-white shadow flex items-center px-4 justify-between z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-gray-600">
                <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Total Relief</h1>
          </div>
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
