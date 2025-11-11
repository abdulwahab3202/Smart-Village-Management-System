import React, { useState, useContext, useEffect, useCallback } from 'react';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const { deleteUser, fetchAllUsers, fetchAllCitizens, fetchAllWorkers } = useContext(StoreContext);
  const [usersToDisplay, setUsersToDisplay] = useState([]);
  const [activeView, setActiveView] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleViewChange = useCallback(async (view) => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (view === 'ALL') data = await fetchAllUsers();
      else if (view === 'CITIZEN') data = await fetchAllCitizens();
      else if (view === 'WORKER') data = await fetchAllWorkers();
      setUsersToDisplay(data || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [fetchAllUsers, fetchAllCitizens, fetchAllWorkers]);
  useEffect(() => {
    handleViewChange('ALL');
  }, [handleViewChange]);

  const handleDelete = (userId, userName) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the user: "${userName}". This is permanent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete user!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(userId).then(() => {
          handleViewChange(activeView);
        });
      }
    });
  };

  const ViewButton = ({ view, label }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeView === view
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard: User Management</h1>
        
        <div className="mb-4 flex space-x-2 p-1 bg-slate-200 rounded-lg">
          <ViewButton view="ALL" label="All Users" />
          <ViewButton view="CITIZEN" label="Citizens Only" />
          <ViewButton view="WORKER" label="Workers Only" />
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading users...</div>
          ) : error ? (
            <div classNameS="p-12 text-center text-red-600 bg-red-100 rounded-md">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {usersToDisplay.length > 0 ? (
                  usersToDisplay.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      No users found for this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;