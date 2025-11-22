import React, { createContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API HELPER ---
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) throw new Error("Not authenticated");

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${currentToken}`, // Fixed backticks
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    // Handle Session Expiry
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`); // Fixed backticks
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null; 
    }
    const data = await response.json();
    return data;
  };

  // --- AUTH FUNCTIONS ---
  const login = async (email, password) => {
    const response = await fetch('http://localhost:8081/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setToken(data.data.token);
      setCurrentUser(data.data.user);
    }
    return data;
  };

  const register = async (formData) => {
    let registrationPayload = {
      name: formData.name, email: formData.email, password: formData.password, role: formData.role,
    };
    if (formData.role === 'CITIZEN') {
      registrationPayload = { ...registrationPayload, phoneNumber: formData.phoneNumber, address: formData.address, city: formData.city, pinCode: formData.pinCode };
    } else if (formData.role === 'WORKER') {
      registrationPayload = { ...registrationPayload, phoneNumber: formData.phoneNumber, specialization: formData.specialization };
    }
    const response = await fetch('http://localhost:8081/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload),
    });
    const data = await response.json();
    if (response.ok && data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setToken(data.data.token);
        setCurrentUser(data.data.user);
    }
    return data;
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setComplaints([]);
    setAllUsers([]);
    setAllAssignments([]);
  };

  // --- DATA FETCHING (With Merging) ---
  const fetchData = async (user) => {
    if (!token || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      // Fetch core data
      const apiCalls = [
        makeAuthenticatedRequest('http://localhost:8080/api/complaint/get-all'),
        makeAuthenticatedRequest('http://localhost:8082/api/work-assignment/get-all-assignments')
      ];
      
      // If Admin, fetch users and workers to resolve names
      if (user.role === 'ADMIN') {
        apiCalls.push(makeAuthenticatedRequest('http://localhost:8081/api/user/get-all'));
        apiCalls.push(makeAuthenticatedRequest('http://localhost:8082/api/worker/get-all'));
      }

      const [complaintsRes, assignmentsRes, usersRes, workersRes] = await Promise.all(apiCalls);

      const allComplaints = complaintsRes.data || [];
      const allAssignmentsData = assignmentsRes.data || [];
      const allUsersData = usersRes ? (usersRes.data || []) : [];
      const allWorkersData = workersRes ? (workersRes.data || []) : [];

      setAllAssignments(allAssignmentsData);
      setAllUsers(allUsersData); // For User Management

      // Create Maps for fast lookups
      const assignmentsMap = new Map(allAssignmentsData.map(a => [a.complaintId, a]));
      const complaintTitleMap = new Map(allComplaints.map(c => [c.id, c.title]));
      
      // Combine citizen and worker lists to find names by ID
      const combinedUserList = [...allUsersData, ...allWorkersData];
      const usersMap = new Map(combinedUserList.map(u => [u.id || u.workerId, u.name]));

      // Enrich Complaints with Worker info
      const enrichedComplaints = allComplaints.map(complaint => ({
        ...complaint,
        assignmentId: assignmentsMap.get(complaint.id)?.assignmentId,
        workerId: assignmentsMap.get(complaint.id)?.workerId,
        userName: usersMap.get(complaint.userId) || 'Unknown User',
      }));
      setComplaints(enrichedComplaints);

      // Enrich Assignments with Complaint Title & Worker Name
      const enrichedAssignments = allAssignmentsData.map(assignment => ({
        ...assignment,
        complaintTitle: complaintTitleMap.get(assignment.complaintId) || 'Unknown Complaint',
        workerName: usersMap.get(assignment.workerId) || 'Unknown Worker',
      }));
      setAllAssignments(enrichedAssignments);

    } catch (err) { 
        if (err.message !== "Session expired") setError(err.message);
    } finally { setLoading(false); }
  };
  
  // Specific Fetch Functions
  const fetchAllUsers = async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all')).data;
  const fetchAllCitizens = async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all-citizens')).data;
  const fetchAllWorkers = async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/get-all')).data;
  const findAvailableWorkers = async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/available')).data;
  const fetchUserComplaints = async (userId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/user/${userId}`)).data;
  const fetchWorkerAssignments = async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/worker/${workerId}`)).data;
  const fetchWorkerById = async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/worker/get/${workerId}`)).data;
  const fetchComplaintById = async (complaintId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/get/${complaintId}`)).data;
  const fetchUserById = async (userId) => (await makeAuthenticatedRequest(`http://localhost:8081/api/user/get/${userId}`)).data;

  // --- ACTION FUNCTIONS ---
  const deleteUser = async (userId) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8081/api/user/delete/${userId}`, { method: 'DELETE' });
      Swal.fire('Deleted!', 'The user has been deleted.', 'success');
    } catch(err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const deleteComplaint = async (complaintId) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/delete/${complaintId}`, { method: 'DELETE' });
      Swal.fire('Deleted!', 'The complaint has been deleted.', 'success');
      await fetchData(currentUser);
    } catch(err) {
      Swal.fire('Error', err.message, 'error');
    }
  };
  
  const assignComplaint = async (complaintId) => {
    if (!currentUser) return;
    try {
        await makeAuthenticatedRequest('http://localhost:8082/api/work-assignment/assign', {
            method: 'POST',
            body: JSON.stringify({ workerId: currentUser.id, complaintId, creditPoints: 100 })
        });
        Swal.fire('Assigned!', 'Complaint assigned successfully.', 'success');
        await fetchData(currentUser);
    } catch(err) {
        Swal.fire('Error', err.message, 'error');
    }
  };

  const updateComplaintStatus = async (assignmentId, newStatus) => {
    try {
        await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/status/${assignmentId}?status=${newStatus}`, { method: 'PUT' });
        Swal.fire('Updated!', 'Status updated successfully.', 'success');
        await fetchData(currentUser);
    } catch(err) {
        Swal.fire('Error', err.message, 'error');
    }
  };

  const applyPenalty = async (assignmentId, penaltyPoints) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/penalty/${assignmentId}?penaltyPoints=${penaltyPoints}`, { method: 'PUT' });
      Swal.fire('Applied!', 'Penalty applied successfully.', 'success');
      await fetchData(currentUser);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };
  
  const updateUser = async (updatePayload) => {
    try {
      const response = await makeAuthenticatedRequest('http://localhost:8081/api/user/update', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });
      const updatedUser = response.data;
      if (updatedUser) {
        const finalUser = { ...JSON.parse(localStorage.getItem('user')), ...updatedUser };
        localStorage.setItem('user', JSON.stringify(finalUser));
        setCurrentUser(finalUser);
        return true;
      }
      return false;
    } catch (err) {
      Swal.fire('Error', 'Failed to update user profile.', 'error');
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      fetchData(user);
    } else {
      setLoading(false);
    }
  }, [token]);

  const contextValue = {
    token, currentUser, complaints, allUsers, allAssignments, loading, error, login, register, logout,
    fetchComplaints: fetchData, fetchAllUsers, fetchAllCitizens, fetchAllWorkers, findAvailableWorkers,
    deleteUser, deleteComplaint, assignComplaint, updateComplaintStatus, applyPenalty, updateUser, 
    fetchUserComplaints, fetchWorkerAssignments, fetchWorkerById, fetchComplaintById, fetchUserById,
    isSignedIn: !!token,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;