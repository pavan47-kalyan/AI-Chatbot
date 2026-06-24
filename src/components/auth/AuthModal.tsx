
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(defaultView);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-gradient-to-r from-purple-600 to-blue-500">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🐕</span> 
            Review Rover Access
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-medium text-sm ${view === 'login' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            onClick={() => setView('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm ${view === 'signup' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            onClick={() => setView('signup')}
          >
            Sign Up
          </button>
        </div>
        
        <div className="p-6">
          {view === 'login' ? (
            <LoginForm onSuccess={onClose} switchToSignup={() => setView('signup')} />
          ) : (
            <SignupForm onSuccess={onClose} switchToLogin={() => setView('login')} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
