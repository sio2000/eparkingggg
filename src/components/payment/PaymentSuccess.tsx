import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const { updateSubscriptionStatus } = useSubscriptionStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const activateSubscription = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Περιμένουμε λίγο για να ολοκληρωθεί το webhook
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Ενημέρωση του subscription status σε premium
        await updateSubscriptionStatus('premium');

        // Επιβεβαίωση της ενημέρωσης
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile?.subscription_status !== 'premium') {
          throw new Error('Subscription update failed');
        }

      } catch (error: any) {
        console.error('Error activating subscription:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    activateSubscription();
  }, [user, navigate, updateSubscriptionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t.paymentError}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              ← {t.backToPricing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.paymentSuccess}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.subscriptionActivated}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            ← {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
} 