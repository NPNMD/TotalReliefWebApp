import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { CreateUserForm } from '../../components/admin/CreateUserForm';
import { UserList } from '../../components/admin/UserList';

export const AdminPage = () => {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Welcome, {userProfile?.displayName}</h3>
          <p className="text-gray-500">
            Use this panel to manage system users. You can create new accounts for Facilities and Supervisors below.
          </p>
        </div>
        
        <CreateUserForm />
        
        <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-lg font-medium mb-4">User List</h3>
           <UserList />
        </div>
      </div>
    </DashboardLayout>
  );
};
