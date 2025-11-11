import React, { createContext, useState, useEffect } from 'react';
export const StoreContext = createContext(null);
const StoreContextProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const makeAuthenticatedRequest = async (url, options = {}) => {
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
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null; 
    }
    const data = await response.json();
    return data;
  };

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

  const fetchData = async (user) => {
    if (!token || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const apiCalls = [
        makeAuthenticatedRequest('http://localhost:8080/api/complaint/get-all'),
        makeAuthenticatedRequest('http://localhost:8082/api/work-assignment/get-all-assignments')
      ];
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
      setAllUsers(allUsersData);
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
      const enrichedAssignments = allAssignmentsData.map(assignment => ({
        ...assignment,
        complaintTitle: complaintTitleMap.get(assignment.complaintId) || 'Unknown Complaint',
        workerName: usersMap.get(assignment.workerId) || 'Unknown Worker',
      }));
      setComplaints(enrichedComplaints);
      setAllAssignments(enrichedAssignments);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  
  const fetchAllUsers = async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all')).data;
  const fetchAllCitizens = async () => (await makeAuthenticatedRequest('http://localhost:8081/api/user/get-all-citizens')).data;
  const fetchAllWorkers = async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/get-all')).data;
  const findAvailableWorkers = async () => (await makeAuthenticatedRequest('http://localhost:8082/api/worker/available')).data;
  const fetchUserComplaints = async (userId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/user/${userId}`)).data;
  const fetchWorkerAssignments = async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/worker/${workerId}`)).data;
  const fetchWorkerById = async (workerId) => (await makeAuthenticatedRequest(`http://localhost:8082/api/worker/get/${workerId}`)).data;
  const fetchComplaintById = async (complaintId) => (await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/get/${complaintId}`)).data;
  const fetchUserById = async (userId) => (await makeAuthenticatedRequest(`http://localhost:8081/api/user/get/${userId}`)).data;

  const deleteUser = async (userId) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8081/api/user/delete/${userId}`, { method: 'DELETE' });
      alert('User deleted successfully.');
    } catch(err) {
      alert(err.message);
    }
  };

  const deleteComplaint = async (complaintId) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8080/api/complaint/delete/${complaintId}`, { method: 'DELETE' });
      alert('Complaint deleted successfully.');
      await fetchData(currentUser);
    } catch(err) {
      alert(err.message);
    }
  };
  
  const assignComplaint = async (complaintId) => {
    if (!currentUser) return;
    try {
        await makeAuthenticatedRequest('http://localhost:8082/api/work-assignment/assign', {
            method: 'POST',
            body: JSON.stringify({ workerId: currentUser.id, complaintId, creditPoints: 100 })
        });
        alert('Complaint assigned successfully!');
        await fetchData(currentUser);
    } catch(err) {
        alert(err.message);
    }
  };

  const updateComplaintStatus = async (assignmentId, newStatus) => {
    try {
        await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/status/${assignmentId}?status=${newStatus}`, { method: 'PUT' });
        alert('Status updated successfully!');
        await fetchData(currentUser);
    } catch(err) {
        alert(`Error: ${err.message}`);
    }
  };

  const applyPenalty = async (assignmentId, penaltyPoints) => {
    try {
      await makeAuthenticatedRequest(`http://localhost:8082/api/work-assignment/penalty/${assignmentId}?penaltyPoints=${penaltyPoints}`, { method: 'PUT' });
      alert('Penalty applied successfully!');
      await fetchData(currentUser);
    } catch (err) {
      alert(`Error: ${err.message}`);
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
      console.error("Failed to update user:", err);
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
    deleteUser, deleteComplaint, assignComplaint, updateComplaintStatus, applyPenalty, updateUser, fetchUserComplaints,
     fetchWorkerAssignments, fetchWorkerById, fetchComplaintById, fetchUserById,
    isSignedIn: !!token,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;