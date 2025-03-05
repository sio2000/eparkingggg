import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          navigate('/login');
          return;
        }

        if (session?.user) {
          console.log('Session found:', session.user);
          setUser(session.user);
          navigate('/', { replace: true });
        } else {
          console.log('No session found');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Error in checkSession:', err);
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  );
} 