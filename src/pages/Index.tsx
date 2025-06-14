
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const Index = () => {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  // Optional: Show a loading spinner or a blank page while redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        <p className="ml-4 text-xl font-semibold text-gray-700">Initializing Kelp...</p>
      </div>
    );
  }

  return null; // Or some minimal loading UI
};

export default Index;
