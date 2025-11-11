import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import ComplaintCard from './ComplaintCard';

const ComplaintList = () => {
  const { complaints, loading, error, currentUser, assignComplaint, updateComplaintStatus } = useContext(StoreContext);
  if (loading) {
    return <div className="text-center p-8 text-slate-500">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">All Complaints</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <ComplaintCard 
                key={complaint.id} 
                complaint={complaint}
                currentUser={currentUser}
                onAssign={assignComplaint}
                onUpdateStatus={updateComplaintStatus}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500 mt-10 p-6 bg-white rounded-lg shadow-sm">
              <p>No complaints have been submitted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ComplaintList;