import React, { createContext, useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API HELPER ---
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) throw new Error("Not authenticated");

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null; 
    }
    const data = await response.json();
    return data;
  }, []);

  // --- AUTH FUNCTIONS ---
  const login = useCallback(async (email, password) => {
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
  }, []);

  const register = useCallback(async (formData) => {
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
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setComplaints([]);
    setAllUsers([]);
    setAllAssignments([]);
  }, []);

  // --- DATA FETCHING (UPDATED FOR ROLE-BASED FILTERING) ---
  const fetchData = useCallback(async (user) => {
    if (!token || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const isAdmin = user.role === 'ADMIN';
      const isWorker = user.role === 'WORKER';

      // 1. Determine which API to use based on role
      let complaintApiUrl = 'http://localhost:8080/api/complaint/get-all'; // Default for Admin/Citizen
      
      if (isWorker) {
          // Use the worker-specific endpoint with category filtering
          const category = user.specialization || 'Plumber'; 
          // Note: Using port 8082 as requested in your prompt
          complaintApiUrl = `http://localhost:8082/api/worker/get-all-complaints`;
      }
      
      const apiCalls = [
        makeAuthenticatedRequest(complaintApiUrl),
        makeAuthenticatedRequest('http://localhost:8082/api/work-assignment/get-all-assignments')
      ];
      if (isAdmin) {
        apiCalls.push(makeAuthenticatedRequest('http://localhost:8081/api/user/get-all'));
        apiCalls.push(makeAuthenticatedRequest('http://localhost:8082/api/worker/get-all'));
      }

      const [complaintsRes, assignmentsRes, usersRes, workersRes] = await Promise.all(apiCalls);

      const allComplaints = complaintsRes.data || [];
      const allAssignmentsData = assignmentsRes.data || [];
      const allUsersData = usersRes ? (usersRes.data || []) : [];
      const allWorkersData = workersRes ? (workersRes.data || []) : [];

      setAllAssignments(allAssignmentsData);
      setAllUsers(allUsersData);
      
      // Merge Data for Display
      const assignmentsMap = new Map(allAssignmentsData.map(a => [a.complaintId, a]));
      const complaintTitleMap = new Map(allComplaints.map(c => [c.id, c.title]));
      
      const combinedUserList = [...allUsersData, ...allWorkersData];
      const usersMap = new Map(combinedUserList.map(u => [u.id || u.workerId, u.name]));

      const enrichedComplaints = allComplaints.map(complaint => ({
        ...complaint,
        assignmentId: assignmentsMap.get(complaint.id)?.assignmentId,
        workerId: assignmentsMap.get(complaint.id)?.workerId,
        userName: usersMap.get(complaint.userId) || 'Unknown User',
      }));
      setComplaints(enrichedComplaints);

      const enrichedAssignments = allAssignmentsData.map(assignment => ({
        ...assignment,
        complaintTitle: complaintTitleMap.get(assignment.complaintId) || 'Unknown Complaint',
        workerName: usersMap.get(assignment.workerId) || 'Unknown Worker',
      }));
      setAllAssignments(enrichedAssignments);

    } catch (err) { 
       if (err.message !== "Session expired") setError(err.message);
    } finally { setLoading(false); }
  }, [token, makeAuthenticatedRequest, logout]);
  
  // Specific Fetch Functions
  const fetchAllUsers = useCallback(async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all')).data, [makeAuthenticatedRequest]);
  const fetchAllCitizens = useCallback(async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all-citizens')).data, [makeAuthenticatedRequest]);
  const fetchAllWorkers = useCallback(async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/get-all')).data, [makeAuthenticatedRequest]);
  const findAvailableWorkers = useCallback(async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/available')).data, [makeAuthenticatedRequest]);
  const fetchUserComplaints = useCallback(async (userId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/user/${userId}`)).data, [makeAuthenticatedRequest]);
  const fetchWorkerAssignments = useCallback(async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/worker/${workerId}`)).data, [makeAuthenticatedRequest]);
  const fetchWorkerById = useCallback(async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/worker/get/${workerId}`)).data, [makeAuthenticatedRequest]);
  const fetchAssignedComplaint = useCallback(async () => (await makeAuthenticatedRequest(`http://localhost:8082/api/worker/get/assigned-complaint`)).data, [makeAuthenticatedRequest]);
  const fetchComplaintById = useCallback(async (complaintId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/get/${complaintId}`)).data, [makeAuthenticatedRequest]);
  const fetchUserById = useCallback(async (userId) => (await makeAuthenticatedRequest(`http://localhost:8081/api/user/get/${userId}`)).data, [makeAuthenticatedRequest]);
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

  const applyPenalty = async (assignmentId) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/penalty/${assignmentId}`, { method: 'PUT' });
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
  }, [token, fetchData]);

  const contextValue = {
    token, currentUser, complaints, allUsers, allAssignments, loading, error, 
    login, register, logout,
    fetchComplaints: () => fetchData(currentUser),
    fetchAllUsers, fetchAllCitizens, fetchAllWorkers, findAvailableWorkers, fetchAssignedComplaint,
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