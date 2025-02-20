import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export const Success = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Περιμένουμε λίγο για να ολοκληρωθεί το webhook
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Ανανεώνουμε το profile
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

          if (profile?.subscription_status === 'premium') {
            // Επιτυχής αναβάθμιση
            navigate('/dashboard', { 
              replace: true,
              state: { 
                message: 'Successfully upgraded to premium!',
                type: 'success'
              }
            });
          } else {
            // Περιμένουμε λίγο ακόμα και ανακατευθύνουμε
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        navigate('/dashboard');
      }
    };

    checkSubscription();
  }, [navigate, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your payment...</h1>
        <p className="text-gray-600">Please wait while we confirm your subscription.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}; 