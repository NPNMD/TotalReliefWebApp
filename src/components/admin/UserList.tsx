import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserProfile } from '../../types';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';

export const UserList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Real-time subscription to users collection
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        userList.push(doc.data() as UserProfile);
      });
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setError('Failed to load users.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserStatus = async (uid: string, currentStatus: boolean) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            isActive: !currentStatus
        });
    } catch (err) {
        console.error("Error updating user status:", err);
        showToast.error("Failed to update user status");
    }
  };

  const deleteUser = async (uid: string) => {
      if(!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
      try {
          await deleteDoc(doc(db, 'users', uid));
          // Note: This only deletes the Firestore doc, not the Auth user.
          // Full deletion requires a Cloud Function (Phase 2).
          showToast.warning("User profile deleted. Note: Auth account still exists until Phase 2 cleanup.");
      } catch (err) {
          console.error("Error deleting user:", err);
          showToast.error("Failed to delete user");
      }
  }

  if (loading) return <div className="p-4 text-center">Loading users...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.uid}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'supervisor' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.role === 'facility' ? user.facilityId : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 {/* @ts-ignore - handling the extended property we added in CreateUserForm */}
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {/* @ts-ignore */}
                  {user.isActive ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    onClick={() => toggleUserStatus(user.uid, (user as any).isActive)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4" title="Toggle Status">
                    {/* @ts-ignore */}
                    {user.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </button>
                <button 
                    onClick={() => deleteUser(user.uid)}
                    className="text-red-600 hover:text-red-900" title="Delete User">
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

