
import { AuthForm } from '@/components/AuthForm';
import { useAuthStatus } from '@/hooks/useAuthStatus'; // To check if already logged in
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home'); // if user is already logged in, go to home
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <AuthForm mode="signup" onSuccess={() => navigate('/onboarding')} />;
};

export default SignupPage;
