import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';

const WorkerProfile = () => {
  const {
    currentUser,
    fetchWorkerAssignments,
    updateUser,
    fetchWorkerById,
    fetchComplaintById,
    fetchAssignedComplaint
  } = useContext(StoreContext);

  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [penalizedComplaints, setPenalizedComplaints] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
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
      if (!currentUser?.id) return;

      setLoadingData(true);
    
      const workerData = await fetchWorkerById(currentUser.id);
      setBackendUser(workerData);

      const complaintId = await fetchAssignedComplaint();
      if (complaintId) {
        const complaint = await fetchComplaintById(complaintId);
        setAssignedComplaints(complaint ? [complaint] : []);
      } else {
        setAssignedComplaints([]);
      }

      const assignments = await fetchWorkerAssignments(currentUser.id);

      const resolved = assignments.filter(a => a.status === "COMPLETED");
      const penalized = assignments.filter(a => a.status === "PENALIZED");

      const resolvedEnriched = await Promise.all(
        resolved.map(async a => {
          const complaint = await fetchComplaintById(a.complaintId);
          return { ...a, title: complaint?.title || "Unknown Complaint" };
        })
      );

      const penalizedEnriched = await Promise.all(
        penalized.map(async a => {
          const complaint = await fetchComplaintById(a.complaintId);
          return { ...a, title: complaint?.title || "Unknown Complaint" };
        })
      );

      setResolvedComplaints(resolvedEnriched);
      setPenalizedComplaints(penalizedEnriched);

      setLoadingData(false);
    };

    loadProfileData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    setUpdateStatus({ error: '', success: '' });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus({ error: '', success: '' });

    const payload = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value !== '')
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
                  <div>
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">New Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="Leave blank to keep current" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">Specialization</label>
                    <select name="specialization" value={formData.specialization} onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-slate-300 rounded-md">
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Cleaner">Cleaner</option>
                    </select>
                  </div>

                  {updateStatus.error && <p className="text-red-500 text-sm text-center">{updateStatus.error}</p>}

                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-slate-200 text-slate-800 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {displayUser?.name}</p>
                  <p><strong>Email:</strong> {displayUser?.email}</p>
                  <p><strong>Phone:</strong> {displayUser?.phoneNumber || 'Not provided'}</p>
                  <p><strong>Specialization:</strong> {displayUser?.specialization || 'Not set'}</p>

                  <button onClick={() => setIsEditing(true)}
                    className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 rounded-lg">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Assigned Complaint</h2>
            <div className="space-y-4">
              {loadingData ? (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">Loading...</p>
              ) : assignedComplaints.length > 0 ? (
                assignedComplaints.map(complaint => (
                  <div key={complaint.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{complaint.title}</p>
                      <p className="text-sm text-slate-500 font-mono">ID: {complaint.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">No assigned complaints.</p>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-700 mt-8 mb-4">Resolved Complaints</h2>
            <div className="space-y-4">
              {loadingData ? (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">Loading...</p>
              ) : resolvedComplaints.length > 0 ? (
                resolvedComplaints.map(a => (
                  <div key={a.assignmentId} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{a.title}</p>
                      <p className="text-sm text-slate-500 font-mono">ID: {a.complaintId}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      COMPLETED
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">No resolved complaints.</p>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-700 mt-8 mb-4">Penalized Complaints</h2>
            <div className="space-y-4">
              {loadingData ? (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">Loading...</p>
              ) : penalizedComplaints.length > 0 ? (
                penalizedComplaints.map(a => (
                  <div key={a.assignmentId} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{a.title}</p>
                      <p className="text-sm text-slate-500 font-mono">ID: {a.complaintId}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      PENALIZED
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">No penalized complaints.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;