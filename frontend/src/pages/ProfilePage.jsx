import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import CitizenProfile from '../components/CitizenProfile'; 
import WorkerProfile from '../components/WorkerProfile';   

const ProfilePage = () => {
  const { currentUser } = useContext(StoreContext);
  if (!currentUser) {
    return <div className="p-8 text-center text-slate-500">Loading user profile...</div>;
  }

  switch (currentUser.role) {
    case 'CITIZEN':
      return <CitizenProfile />;
    case 'WORKER':
      return <WorkerProfile />;
    case 'ADMIN':
      return (
        <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="container mx-auto max-w-4xl">
            
            <div className="flex items-center space-x-4 mb-8">
              <img 
                src="https://ik.imagekit.io/abdulwahab/images/profile.png?updatedAt=1748609998901" 
                className='h-20 w-20 rounded-full ring-4 ring-indigo-500' 
                alt='profile'
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-lg text-slate-600">
                  Welcome back, <span className="font-bold">{currentUser.name}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-slate-700 mb-4">Management Tools</h2>
              <p className="text-slate-600 mb-6">
                Quickly access all management dashboards from here.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/complaints" className="group relative block p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all transform hover:-translate-y-1">
                  <h3 className="font-bold text-xl">Complaint Management</h3>
                  <p className="text-sm text-indigo-100 mt-1">View and delete all user complaints.</p>
                </Link>
                
                <Link to="/admin/users" className="group relative block p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all transform hover:-translate-y-1">
                  <h3 className="font-bold text-xl">User Management</h3>
                  <p className="text-sm text-blue-100 mt-1">View, filter, and delete users.</p>
                </Link>
                
                <Link to="/admin/worker-assignments" className="group relative block p-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all transform hover:-translate-y-1">
                  <h3 className="font-bold text-xl">Worker & Assignment</h3>
                  <p className="text-sm text-green-100 mt-1">Manage workers and apply penalties.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return <div className="p-8 text-center text-slate-500">Unknown user role.</div>;
  }
};

export default ProfilePage;