import React, { useState } from 'react';

const getStatusBadgeColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'NOT ASSIGNED':
      return 'bg-blue-100 text-blue-800';
    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-800';
    case 'IN PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENALIZED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const ComplaintCard = ({ complaint = {}, currentUser, onAssign, onUpdateStatus }) => {
  const { id, imageBase64, title, description, status, createdOn, createOn, workerId, assignmentId } = complaint;
  const [newStatus, setNewStatus] = useState('IN PROGRESS');
  const dateValue = createdOn || createOn;
  let formattedDate = 'Invalid Date';
  if (dateValue) {
    formattedDate = new Date(dateValue).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  const isWorker = currentUser && currentUser.role === 'WORKER';
  const isAssignedToMe = isWorker && currentUser.id === workerId;
  const isCompleted = status?.toUpperCase() === 'COMPLETED';
  const isUnassigned = status?.toUpperCase() === 'NOT ASSIGNED';
  if (!id) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
      <div>
        <img 
          className="w-full h-48 object-cover" 
          src={imageBase64} 
          alt={title} 
        />
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(status)}`}>{status || 'Submitted'}</span>
            <p className="text-xs text-slate-400">{formattedDate}</p>
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate">{title}</h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{description}</p>
        </div>
      </div>
      {isWorker && isUnassigned && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => onAssign(id)}
            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Assign Yourself
          </button>
        </div>
      )}
      {isAssignedToMe && !isCompleted && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-5 center">
          <label htmlFor={`status-select-${id}`} className="sr-only">Update Status</label>
          <select 
            id={`status-select-${id}`}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button 
            onClick={() => onUpdateStatus(assignmentId, newStatus)}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Submit Update
          </button>
        </div>
      )}
      {isCompleted && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            disabled
            className="w-full bg-slate-300 text-slate-500 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
          >
            Complaint Resolved
          </button>
        </div>
      )}
    </div>
  );
};
export default ComplaintCard;