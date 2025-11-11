import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import ComplaintCard from './ComplaintCard';
import Swal from 'sweetalert2';

const CitizenProfile = () => {
  const { currentUser, fetchUserComplaints, updateUser, fetchUserById } = useContext(StoreContext);
  const [isEditing, setIsEditing] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [backendUser, setBackendUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phoneNumber: '',
    address: '',
    city: '',
    pinCode: '',
  });
  const [updateStatus, setUpdateStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    const fetchBackendUser = async () => {
      if (currentUser?.id) {
        try {
          const data = await fetchUserById(currentUser.id);
          setBackendUser(data);
          setFormData({
            name: data.name || '',
            password: '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            city: data.city || '',
            pinCode: data.pinCode || '',
          });
        } catch (error) {
          console.error("Failed to fetch backend user:", error);
        }
      }
    };
    fetchBackendUser();
  }, [currentUser, fetchUserById]);
  useEffect(() => {
    const loadComplaints = async () => {
      if (currentUser?.id) {
        setLoadingComplaints(true);
        const data = await fetchUserComplaints(currentUser.id);
        setMyComplaints(data || []);
        setLoadingComplaints(false);
      }
    };
    loadComplaints();
  }, [currentUser, fetchUserComplaints]);

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
    if (formData.pinCode.toString()) {
      payload.pinCode = parseInt(formData.pinCode, 10) || 0;
    }

    if (Object.keys(payload).length === 0) {
      return setUpdateStatus({ error: 'Please enter a value to update.', success: '' });
    }

    const success = await updateUser(payload);
    if (success) {
      Swal.fire('Success!', 'Your profile has been updated.', 'success');
      setIsEditing(false);
      setBackendUser(prev => ({...prev, ...payload}));
    } else {
      setUpdateStatus({ error: 'Failed to update profile.', success: '' });
    }
  };
  const displayUser = backendUser || currentUser;

  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Citizen Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Details</h2>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div><label className="text-sm font-medium">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" /></div>
                  <div><label className="text-sm font-medium">New Password</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" placeholder="Leave blank to keep current" /></div>
                  <div><label className="text-sm font-medium">Phone</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" /></div>
                  <div><label className="text-sm font-medium">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" /></div>
                  <div><label className="text-sm font-medium">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" /></div>
                  <div><label className="text-sm font-medium">PIN Code</label><input type="number" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" /></div>
                  {updateStatus.error && <p className="text-red-500 text-sm">{updateStatus.error}</p>}
                  {updateStatus.success && <p className="text-green-500 text-sm">{updateStatus.success}</p>}
                  <div className="flex space-x-2">
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-slate-200 py-2 rounded-lg hover:bg-slate-300">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {displayUser?.name}</p>
                  <p><strong>Email:</strong> {displayUser?.email}</p>
                  <p><strong>Phone:</strong> {displayUser?.phoneNumber || 'Not provided'}</p>
                  <p><strong>Address:</strong> {displayUser?.address || 'Not provided'}</p>
                  <p><strong>City:</strong> {displayUser?.city || 'Not provided'}</p>
                  <p><strong>PIN Code:</strong> {displayUser?.pinCode || 'Not provided'}</p>
                  <button onClick={() => setIsEditing(true)} className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-7O0">Edit Profile</button>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Submitted Complaints</h2>
            {loadingComplaints ? (
              <p>Loading complaints...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myComplaints.length > 0
                  ? myComplaints.map(c => <ComplaintCard key={c.id} complaint={c} />)
                  : <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">You have no complaints.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;