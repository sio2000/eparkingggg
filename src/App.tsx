import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpForm } from './components/auth/SignUpForm';
import { AuthProvider } from './components/AuthProvider';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { PricingPage } from './components/pricing/PricingPage';
import { PaymentSuccess } from './components/payment/PaymentSuccess';
import { PaymentCancel } from './components/payment/PaymentCancel';
import { AuthCallback } from './components/auth/AuthCallback';
import { ErrorBoundary } from './components/ErrorBoundary';

// Απλό component για το κύριο layout
function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;