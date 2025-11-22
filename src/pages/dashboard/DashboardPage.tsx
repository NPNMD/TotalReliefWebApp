import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RosterList } from '../../components/roster/RosterList';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage = () => {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
           {userProfile?.role === 'facility' ? 'Available Supervisors' : 'User Roster'}
        </h2>
        <p className="text-gray-500">
          {userProfile?.role === 'facility' 
            ? 'Select a supervisor below to initiate a video consultation.'
            : 'View online status of facility staff and other supervisors.'}
        </p>
      </div>
      
      <RosterList />
    </DashboardLayout>
  );
};
