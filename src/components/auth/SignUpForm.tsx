import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { UserPlus, Mail } from 'lucide-react';

export function SignUpForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { signUp, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  React.useEffect(() => {
    return () => clearError();
  }, [clearError]);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Ελέγξτε το email σας
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Έχουμε στείλει ένα email επιβεβαίωσης στο {email}. 
              Παρακαλούμε ελέγξτε τα εισερχόμενά σας και ακολουθήστε τις οδηγίες για να ολοκληρώσετε την εγγραφή σας.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ← Επιστροφή στη σελίδα σύνδεσης
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img
              className="mx-auto h-[256px] w-auto"
              src="/assets/plogo.png"
              alt="e-Parking"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Δημιουργία λογαριασμού
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Διεύθυνση Email"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Κωδικός"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Εγγραφή
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Έχετε ήδη λογαριασμό; Συνδεθείτε
          </Link>
        </div>
      </div>
    </div>
  );
} 