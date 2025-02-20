import { createBrowserRouter } from 'react-router-dom';
import { SignInPage } from './components/auth/SignInPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { PaymentSuccess } from './components/payment/PaymentSuccess';
import { PaymentCancel } from './components/payment/PaymentCancel';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/payment-success',
    element: <PaymentSuccess />,
  },
  {
    path: '/payment-cancel',
    element: <PaymentCancel />,
  }
]); 