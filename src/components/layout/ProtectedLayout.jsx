import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../ui';
import { useAuth } from '../../context/AuthContext';
const ProtectedLayout = () => {
  var { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    try {
      const userData = localStorage.getItem('barber_user');
      if (userData) {
        setUser(userData);
        return;
      }
    }
    catch (error) {
      console.error('Error while parsing user data from local storage');
    }

    console.error('User is not logged in');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user}
        onLogout={async () => {
          await logout();
          navigate('/');
        }} 
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
export default ProtectedLayout;