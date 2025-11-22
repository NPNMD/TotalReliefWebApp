import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { UserProfile } from '../../types';
import { X, KeyRound } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface EditUserFormProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onSuccess }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'facility'>(user.role);
  const [facilityId, setFacilityId] = useState(user.facilityId || '');
  const [phone, setPhone] = useState((user as any).phone || ''); // Cast as any if phone not in type yet
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  // Facilities list (hardcoded for now as per design doc)
  const facilities = [
    "Houston Medical Center",
    "Memorial Hermann",
    "Methodist Hospital",
    "St. Luke's Hospital",
    "Texas Children's Hospital",
    "MD Anderson Cancer Center",
    "CHI St. Luke's Health",
    "TIRR Memorial Hermann"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        displayName,
        role,
        facilityId: role === 'facility' ? facilityId : null,
        phone
      });

      showToast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      showToast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) return;
    
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast.success(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      showToast.error("Failed to send reset email: " + error.message);
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <input
                type="text"
                value={user.email}
                disabled
                className="flex-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-l-md text-gray-500 sm:text-sm"
                />
                <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={resetSending}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    title="Send Password Reset Email"
                >
                    {resetSending ? '...' : <KeyRound className="w-4 h-4" />}
                </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Click the key icon to send a password reset email.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="facility">Facility User</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {role === 'facility' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Facility</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a facility</option>
                {facilities.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-000-0000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

