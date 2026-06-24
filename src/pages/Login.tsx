
import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-500">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🐕</span> 
              Review Rover Access
            </h1>
          </div>
          <div className="p-6">
            <LoginForm onSuccess={() => {}} switchToSignup={() => window.location.href = '/signup'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
