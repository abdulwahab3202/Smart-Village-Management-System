import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';

const WorkerAssignmentManagement = () => {
  const { allAssignments, findAvailableWorkers, applyPenalty, loading, error } = useContext(StoreContext);
  const [availableWorkers, setAvailableWorkers] = useState([]);

  useEffect(() => {
    const getWorkers = async () => {
      const workers = await findAvailableWorkers();
      if (workers) setAvailableWorkers(workers);
    };
    getWorkers();
  }, [findAvailableWorkers]);

  const handleApplyPenalty = (assignmentId) => {
    Swal.fire({
      title: 'Apply Penalty',
      text: 'Enter the number of penalty points to apply:',
      input: 'number',
      inputAttributes: {
        min: '1',
        step: '1'
      },
      inputValue: 10,
      showCancelButton: true,
      confirmButtonText: 'Apply Penalty',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const penaltyPoints = parseInt(result.value, 10);
        if (!isNaN(penaltyPoints) && penaltyPoints > 0) {
          applyPenalty(assignmentId, penaltyPoints);
        } else {
          Swal.fire('Error', 'Please enter a valid number greater than zero.', 'error');
        }
      }
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'PENALIZED':
        return 'bg-red-100 text-red-800';
      case 'SUBMITTED':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard: Worker & Assignment Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Available Workers</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading...</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {availableWorkers && availableWorkers.length > 0 ? (
                    availableWorkers.map((worker) => (
                      <li key={worker.workerId} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{worker.name}</p>
                          <p className="text-sm text-slate-500">{worker.specialization}</p>
                        </div>
                        <p className="text-sm text-slate-500">Credits: <span className="font-bold">{worker.totalCredits}</span></p>
                      </li>
                    ))
                  ) : (
                    <li className="p-12 text-center text-slate-500">No workers are currently available.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">All Work Assignments</h2>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading...</div>
              ) : error ? (
                <div className="p-12 text-center text-red-600">{error}</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Complaint Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Worker Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {allAssignments && allAssignments.length > 0 ? (
                      allAssignments.map((assignment) => (
                        <tr key={assignment.assignmentId}>
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium" title={assignment.complaintId}>
                            {assignment.complaintTitle}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500" title={assignment.workerId}>
                            {assignment.workerName}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            <button
                              onClick={() => handleApplyPenalty(assignment.assignmentId)}
                              className="text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                              disabled={assignment.status !== 'COMPLETED'}
                            >
                              Apply Penalty
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-500">No assignments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkerAssignmentManagement;