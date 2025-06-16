
import React from 'react';
import { Leaf } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Leaf className="w-16 h-16 text-green-600 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">Kelp</h1>
          <p className="text-gray-600 mt-1">{mode === 'signup' ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {mode === 'signup' ? (
          <SignupForm onSuccess={onSuccess} />
        ) : (
          <LoginForm onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthForm;
