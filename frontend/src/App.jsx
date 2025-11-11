import React, { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StoreContext } from './context/StoreContext';
import Swal from 'sweetalert2';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ComplaintList from './components/ComplaintList';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import WorkerAssignmentManagement from './pages/WorkerAssignmentManagement';
import AuthForm from './components/AuthForm';
import CreateComplaintForm from './components/CreateComplaintForm';
import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
  const { currentUser, isSignedIn, fetchComplaints } = useContext(StoreContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const openComplaintModal = () => setShowComplaintModal(true);
  const closeComplaintModal = () => setShowComplaintModal(false);

  const handleComplaintCreated = () => {
    closeComplaintModal();
    Swal.fire({
      title: 'Success!',
      text: 'Your complaint has been submitted.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    if (fetchComplaints) {
      fetchComplaints(); 
    }
  };

  return (
    <div className="bg-slate-50 font-sans antialiased flex flex-col min-h-screen">
      <Navbar onSignInClick={openAuthModal} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onReportClick={openComplaintModal} />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          {currentUser && currentUser.role === 'ADMIN' && (
            <>
              <Route path="/admin/complaints" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/worker-assignments" element={<ProtectedRoute adminOnly={true}><WorkerAssignmentManagement /></ProtectedRoute>} />
            </>
          )}
        </Routes>
      </main>
      <Footer />
      {showAuthModal && <AuthForm onClose={closeAuthModal} />}
      {showComplaintModal && <CreateComplaintForm onClose={closeComplaintModal} onSuccess={handleComplaintCreated} />}
    </div>
  );
};
export default App;