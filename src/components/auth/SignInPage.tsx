import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { Link, useNavigate } from 'react-router-dom';

export function SignInPage() {
  console.log('SignInPage rendering');
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { language } = useLanguageStore();
  const t = translations[language];

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (data.session) {
        console.log('Sign in successful');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-[256px] w-auto"
            src="/assets/plogo.png"
            alt="e-Parking"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.signIn}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t.email}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md 
                  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.email}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md
                  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.password}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.signingIn : t.signIn}
            </button>

            <Link
              to="/signup"
              className="w-full flex justify-center py-2 px-4 border border-blue-600
                text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transition-colors duration-200"
            >
              {t.createAccount}
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {t.orContinueWith}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300
                rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 hover:shadow-md group"
            >
              <img
                className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
              />
              {t.continueWithGoogle}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 