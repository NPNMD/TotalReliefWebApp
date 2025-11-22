import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserRole } from '../../types';

// We need a secondary app to create users without logging out the admin
// This is a common pattern for client-side admin panels in MVP phase
const firebaseConfig = {
  apiKey: "AIzaSyAtBRrVvheg2cIVyBq7RfXLTRlwXGhyw6Q",
  authDomain: "totalreliefmd.firebaseapp.com",
  projectId: "totalreliefmd",
  storageBucket: "totalreliefmd.firebasestorage.app",
  messagingSenderId: "906049680832",
  appId: "1:906049680832:web:76093f680d8a3009398425",
  measurementId: "G-CT16QBMPPC"
};

export const CreateUserForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('facility');
  const [facilityId, setFacilityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    // Initialize secondary app
    const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
    const secondaryAuth = getAuth(secondaryApp);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      // 2. Create Firestore Document (using primary app's db with admin permissions)
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        displayName,
        role,
        facilityId: role === 'facility' ? facilityId : null, // Only facilities need IDs
        status: 'offline',
        createdAt: serverTimestamp(),
        isActive: true,
        // Default settings
        notificationPreferences: {
          smsEnabled: true,
          emailEnabled: true,
          inAppSoundsEnabled: true
        }
      });

      // 3. Cleanup secondary auth
      await signOut(secondaryAuth);
      
      setMessage({ type: 'success', content: `User ${email} created successfully!` });
      // Reset form
      setEmail('');
      setPassword('');
      setDisplayName('');
      
    } catch (error: any) {
      console.error("Error creating user:", error);
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
      // Delete the secondary app instance to free resources (optional, but good practice)
      // deleteApp(secondaryApp); // Note: deleteApp is async, skipping for simplicity in this snippet
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4">Create New User</h3>
      
      {message.content && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.content}
        </div>
      )}

      <form onSubmit={handleCreateUser} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="facility">Facility User</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          {role === 'facility' && (
             <div>
             <label className="block text-sm font-medium text-gray-700">Facility Name/ID</label>
             <input
               type="text"
               required
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
               value={facilityId}
               onChange={(e) => setFacilityId(e.target.value)}
               placeholder="e.g. Houston Medical Center"
             />
           </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

