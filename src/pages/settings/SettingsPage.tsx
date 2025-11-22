import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFCM } from '../../hooks/useFCM';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Bell, Volume2, User } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const SettingsPage = () => {
  const { userProfile, currentUser } = useAuth();
  const { permission, requestPermission, error: fcmError } = useFCM();
  const [loading, setLoading] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Local state for preferences (would normally come from userProfile)
  const [soundsEnabled, setSoundsEnabled] = useState(userProfile?.notificationPreferences?.inAppSoundsEnabled ?? true);

  const handleRequestPermission = async () => {
    if (permission === 'denied') {
      alert('Notifications are blocked. Please enable them in your browser settings.');
      return;
    }
    setRequestingPermission(true);
    await requestPermission();
    setRequestingPermission(false);
  };

  const handleTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Total Relief.',
        icon: '/vite.svg' // Placeholder
      });
      showToast.success('Test notification sent');
    } else {
      showToast.error('Permission not granted');
    }
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
            'notificationPreferences.inAppSoundsEnabled': soundsEnabled
        });
        showToast.success('Preferences saved');
    } catch (error) {
        console.error("Error saving preferences:", error);
        showToast.error("Failed to save preferences");
    } finally {
        setLoading(false);
    }
  };

  if (!userProfile) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Display Name</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile.displayName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <span className={`mt-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${userProfile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    userProfile.role === 'supervisor' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {userProfile.role}
                </span>
            </div>
            {userProfile.facilityId && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Facility</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile.facilityId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          </div>
          
          {fcmError && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error enabling notifications</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{fcmError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Status: <span className={permission === 'granted' ? 'text-green-600' : permission === 'denied' ? 'text-red-600' : 'text-yellow-600'}>
                    {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Disabled'}
                  </span>
                </p>
                {permission === 'denied' && (
                    <p className="text-xs text-red-500 mt-1">
                        Please enable notifications in your browser settings to receive alerts.
                    </p>
                )}
              </div>
              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  disabled={requestingPermission}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      permission === 'denied' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {requestingPermission ? 'Enabling...' : permission === 'denied' ? 'Blocked' : 'Enable'}
                </button>
              )}
              {permission === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Test Notification
                </button>
              )}
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
                <div className="flex items-center">
                    <Volume2 className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">In-App Sounds</p>
                        <p className="text-sm text-gray-500">Play sounds for incoming calls</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={soundsEnabled} 
                        onChange={(e) => setSoundsEnabled(e.target.checked)}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
            <button
                onClick={handleSavePreferences}
                disabled={loading}
                className={`px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } shadow-sm`}
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

