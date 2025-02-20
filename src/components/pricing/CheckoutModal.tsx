import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { supabase } from '../../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting payment process for user:', user.id);

      // Απευθείας ανακατεύθυνση στο Stripe Checkout URL
      const checkoutUrl = 'https://buy.stripe.com/test_fZe7sYgbI0fK7PGfZa';
      
      // Προσθήκη παραμέτρων για success και cancel URLs
      const successUrl = encodeURIComponent(`${window.location.origin}/payment-success`);
      const cancelUrl = encodeURIComponent(`${window.location.origin}/payment-cancel`);
      
      const finalUrl = `${checkoutUrl}?success_url=${successUrl}&cancel_url=${cancelUrl}&client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email || '')}`;
      
      console.log('Redirecting to:', finalUrl);
      window.location.href = finalUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(`${t.errorOccurred}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t.upgradeToPremium}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {t.upgradeMessage}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>{t.premiumFeature1}</li>
            <li>{t.premiumFeature2}</li>
            <li>{t.premiumFeature4}</li>
          </ul>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t.premiumPlan}</p>
            <p className="text-lg font-semibold">9.99€ / {t.perMonth}</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : (
              t.continueToPayment
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            {t.paymentDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
} 