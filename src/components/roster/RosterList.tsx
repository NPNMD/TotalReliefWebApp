import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { UserCard } from './UserCard';
import { Search, Filter } from 'lucide-react';

export const RosterList = () => {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [presenceData, setPresenceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy' | 'away' | 'offline'>('all');

  useEffect(() => {
    if (!userProfile) return;

    // Query all users (removed isActive filter to ensure we get everyone, we can filter later)
    // This also helps if the isActive field is missing on some docs
    const usersQuery = query(
        collection(db, 'users')
    );

    // Listen to Users
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
            const userData = doc.data() as UserProfile;
            if (userData.isActive !== false) { 
                 fetchedUsers.push(userData);
            }
        }
      });
      setUsers(fetchedUsers);
      setLoading(false); // Set loading false after initial user fetch
    }, (error) => {
        console.error("Error fetching roster users:", error);
        setLoading(false);
    });

    // Listen to Presence
    const presenceQuery = query(collection(db, 'presence'));
    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
        const newPresenceData: Record<string, string> = {};
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status) {
                newPresenceData[doc.id] = data.status;
            }
        });
        setPresenceData(newPresenceData);
    }, (error) => {
        console.error("Error fetching presence:", error);
    });

    return () => {
        unsubscribeUsers();
        unsubscribePresence();
    };
  }, [userProfile, currentUser]);

  const filteredUsers = useMemo(() => {
    // Merge users with real-time presence status
    const usersWithStatus = users.map(user => ({
        ...user,
        status: (presenceData[user.uid] || user.status || 'offline') as 'online' | 'available' | 'busy' | 'away' | 'offline'
    }));

    let filtered = usersWithStatus.filter(user => {
      // Search Filter
      const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.facilityId && user.facilityId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status Filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort Logic: Online/Available first, then alphabetical
    return filtered.sort((a, b) => {
        const isAOnline = a.status === 'online' || a.status === 'available';
        const isBOnline = b.status === 'online' || b.status === 'available';
        
        if (isAOnline && !isBOnline) return -1;
        if (!isAOnline && isBOnline) return 1;
        
        const nameA = a.displayName || '';
        const nameB = b.displayName || '';
        return nameA.localeCompare(nameB);
    });
  }, [users, presenceData, searchTerm, statusFilter]);

  const handleCall = (user: UserProfile) => {
      const event = new CustomEvent('initiate-call', { detail: user });
      window.dispatchEvent(event);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading roster...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user.uid} user={user} onCall={handleCall} />
          ))}
        </div>
      )}
    </div>
  );
};
