import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loader size="large" text="Verifying administrator credentials..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
