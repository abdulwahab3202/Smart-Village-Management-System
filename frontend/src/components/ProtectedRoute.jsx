import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isSignedIn, currentUser } = useContext(StoreContext);
  const location = useLocation();
  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (adminOnly && (!currentUser || currentUser.role !== 'ADMIN')) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;