import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { UserCard } from './UserCard';

export const RosterList = () => {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    let q;
    
    if (userProfile.role === 'facility') {
        q = query(
            collection(db, 'users'), 
            where('role', '==', 'supervisor'),
            where('isActive', '==', true)
        );
    } else {
         q = query(
            collection(db, 'users'), 
            where('isActive', '==', true)
        );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
            fetchedUsers.push(doc.data() as UserProfile);
        }
      });
      
      fetchedUsers.sort((a, b) => {
          // 'available' status is what we mean by online for calling purposes
          if (a.status === 'available' && b.status !== 'available') return -1;
          if (a.status !== 'available' && b.status === 'available') return 1;
          return a.displayName.localeCompare(b.displayName);
      });

      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching roster:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile, currentUser]);

  const handleCall = (user: UserProfile) => {
      const event = new CustomEvent('initiate-call', { detail: user });
      window.dispatchEvent(event);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading roster...</div>;

  if (users.length === 0) {
      return (
          <div className="p-8 text-center bg-white rounded-lg shadow">
              <p className="text-gray-500">No available users found.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard key={user.uid} user={user} onCall={handleCall} />
      ))}
    </div>
  );
};

