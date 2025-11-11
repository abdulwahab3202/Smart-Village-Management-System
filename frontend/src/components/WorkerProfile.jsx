import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';

const WorkerProfile = () => {
  const { 
    currentUser, 
    fetchWorkerAssignments, 
    updateUser, 
    fetchWorkerById,
    fetchComplaintById 
  } = useContext(StoreContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [myAssignments, setMyAssignments] = useState([]);
  const [backendUser, setBackendUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phoneNumber: '',
    specialization: 'Plumber',
  });
  const [updateStatus, setUpdateStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    const loadProfileData = async () => {
      if (currentUser?.id) {
        setLoadingData(true);
        const [detailsData, assignmentsData] = await Promise.all([
            fetchWorkerById(currentUser.id),
            fetchWorkerAssignments(currentUser.id)
        ]);
        
        if (detailsData) {
          setBackendUser(detailsData);
          setFormData({
            name: detailsData.name || '',
            password: '',
            phoneNumber: detailsData.phoneNumber || '',
            specialization: detailsData.specialization || 'Plumber',
          });
        }
        
        if (assignmentsData) {
          const enrichedAssignments = await Promise.all(
            assignmentsData.map(async (assignment) => {
              const complaintDetails = await fetchComplaintById(assignment.complaintId);
              return {
                ...assignment,
                title: complaintDetails ? complaintDetails.title : 'Complaint details not found',
              };
            })
          );
          setMyAssignments(enrichedAssignments || []);
        }
        
        setLoadingData(false);
      }
    };
    loadProfileData();
  }, [currentUser, fetchWorkerById, fetchWorkerAssignments, fetchComplaintById]);

  const handleInputChange = (e) => {
    setUpdateStatus({ error: '', success: '' });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus({ error: '', success: '' });
    const payload = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          if (key === 'password') return value !== '';
          return value !== '';
        })
    );

    if (Object.keys(payload).length === 0) {
        return setUpdateStatus({ error: 'Please enter a value to update.', success: '' });
    }
    
    const success = await updateUser(payload);
    if (success) {
      Swal.fire('Success!', 'Your profile has been updated.', 'success');
      setIsEditing(false);
      setBackendUser(prev => ({ ...prev, ...payload }));
    } else {
      setUpdateStatus({ error: 'Failed to update profile. Please try again.', success: '' });
    }
  };
  const displayUser = backendUser || currentUser;

  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Worker Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold text-slate-700 mb-2">Your Credit Score</h2>
                 <p className="text-5xl font-bold text-green-500">{displayUser?.totalCredits || 0}</p>
             </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Details</h2>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div><label className="text-sm font-medium text-slate-600">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/></div>
                  <div><label className="text-sm font-medium text-slate-600">New Password</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="Leave blank to keep current"/></div>
                  <div><label className="text-sm font-medium text-slate-600">Phone</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/></div>
                  <div><label className="text-sm font-medium text-slate-600">Specialization</label>
                    <select name="specialization" value={formData.specialization} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md">
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Cleaner">Cleaner</option>
                    </select>
                  </div>
                  {updateStatus.error && <p className="text-red-500 text-sm text-center">{updateStatus.error}</p>}
                  {updateStatus.success && <p className="text-green-500 text-sm text-center">{updateStatus.success}</p>}
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-slate-200 text-slate-800 py-2 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {displayUser?.name}</p>
                  <p><strong>Email:</strong> {displayUser?.email}</p>
                  <p><strong>Phone:</strong> {displayUser?.phoneNumber || 'Not provided'}</p>
                  <p><strong>Specialization:</strong> {displayUser?.specialization || 'Not set'}</p>
                  <button onClick={() => setIsEditing(true)} className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors">Edit Profile</button>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Assigned Complaints</h2>
            {loadingData ? <p className="text-slate-500">Loading your assignments...</p> : (
              <div className="space-y-4">
                {myAssignments.length > 0 ? myAssignments.map(assignment => (
                  <div key={assignment.assignmentId} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                        <p className="font-bold text-slate-800">
                          {assignment.title}
                        </p>
                        <p className="text-sm text-slate-500 font-mono" title={assignment.complaintId}>
                          ID: {assignment.complaintId}
                        </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {assignment.status}
                    </span>
                  </div>
                )) : <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">You have no complaints assigned to you.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;