import React, { useState, useContext, useEffect, useCallback, useTransition } from 'react';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const { deleteUser, fetchAllUsers, fetchAllCitizens, fetchAllWorkers } = useContext(StoreContext);

  const [usersToDisplay, setUsersToDisplay] = useState([]);
  const [activeView, setActiveView] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewChange = useCallback(async (view) => {
    setActiveView(view);
    setLoading(true);
    setError(null);

    try {
      let data = [];

      if (view === 'ALL') data = await fetchAllUsers();
      if (view === 'CITIZEN') data = await fetchAllCitizens();
      if (view === 'WORKER') data = await fetchAllWorkers();

      setUsersToDisplay(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers, fetchAllCitizens, fetchAllWorkers]);

  useEffect(() => {
    handleViewChange('ALL');
  }, [handleViewChange]);

  const handleDelete = (userId, userName) => {
    Swal.fire({
      title: 'Confirm Delete?',
      text: `Delete user "${userName}" permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(userId).then(() => handleViewChange(activeView));
      }
    });
  };

  const ViewButton = ({ view, label }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors
      ${activeView === view ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-slate-100 px-4 py-5 sm:p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center sm:text-left">
          Admin Dashboard: User Management
        </h1>

        {/* FILTER BUTTONS responsive layout */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 bg-white rounded-lg shadow-sm">
          <ViewButton view="ALL" label="All Users" />
          <ViewButton view="CITIZEN" label="Citizens" />
          <ViewButton view="WORKER" label="Workers" />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading users...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 bg-red-100 rounded-md">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-600">Role</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersToDisplay.length ? (
                    usersToDisplay.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm">{user.name}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {user.role || (activeView === "WORKER" ? "WORKER" : "N/A")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;