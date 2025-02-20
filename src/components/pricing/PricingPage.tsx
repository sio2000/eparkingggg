import React, { useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { stripePromise } from '../../lib/stripe';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { CheckoutModal } from './CheckoutModal';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';

export function PricingPage() {
  const mounted = useRef(true);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    return () => {
      mounted.current = false;
    };
  }, [user, navigate]);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      if (mounted.current) {
        const successUrl = `${window.location.origin}/payment-success`;
        const cancelUrl = `${window.location.origin}/payment-cancel`;
        
        const encodedSuccessUrl = encodeURIComponent(successUrl);
        const encodedCancelUrl = encodeURIComponent(cancelUrl);
        
        const checkoutUrl = `https://buy.stripe.com/test_6oE28EcZw5A4c5W28j?client_reference_id=${user.id}&success_url=${encodedSuccessUrl}&cancel_url=${encodedCancelUrl}`;
        
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (mounted.current) {
        alert(t.paymentError || 'Παρουσιάστηκε σφάλμα κατά την πληρωμή. Παρακαλώ δοκιμάστε ξανά.');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setShowModal(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const plans = [
    {
      name: t.basicPlan,
      price: '0€',
      period: t.forever,
      features: [
        t.basicFeature1,
        t.basicFeature2,
        t.basicFeature3,
        t.basicFeature4,
      ],
      notIncluded: [
        t.premiumFeature1,
        t.premiumFeature2,
        t.premiumFeature4,
        t.premiumFeature5,
        t.premiumFeature6,
      ],
      buttonText: t.currentPlan,
      disabled: true,
    },
    {
      name: t.premiumPlan,
      price: '9.99€',
      period: t.perMonth,
      features: [
        t.premiumFeature1,
        t.premiumFeature2,
        t.premiumFeature3,
        t.premiumFeature4,
        t.premiumFeature5,
        t.premiumFeature6,
        t.premiumFeature7,
      ],
      notIncluded: [],
      buttonText: t.upgradeToPremium,
      highlight: true,
      description: t.premiumDescription,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t.choosePlan}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.pricingSubtitle}
            </p>
            <p className="mt-2 text-sm text-blue-600">
              {t.premiumNotice}
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg divide-y divide-gray-200 transform transition-all duration-300 hover:scale-102
                  ${plan.highlight
                    ? 'border-2 border-blue-500 relative bg-white shadow-2xl hover:shadow-blue-200/50'
                    : 'border border-gray-200 bg-white shadow-xl hover:shadow-gray-200/50'
                  }
                  hover:-translate-y-1 group`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                    <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-blue-700 
                      px-4 py-1 text-sm font-semibold text-white shadow-lg">
                      {t.recommended}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className={`text-2xl font-semibold transition-colors duration-300 
                    ${plan.highlight ? 'text-blue-600' : 'text-gray-900'} 
                    group-hover:scale-105 transform transition-transform`}>
                    {plan.name}
                  </h3>
                  
                  {plan.description && (
                    <p className="mt-2 text-sm text-gray-500 transition-all duration-300 group-hover:text-gray-700">
                      {plan.description}
                    </p>
                  )}
                  
                  <p className="mt-8 flex items-end transition-all duration-300 group-hover:transform group-hover:translate-x-2">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-base font-medium text-gray-500 ml-1">/{plan.period}</span>
                  </p>
                  
                  <button
                    disabled={plan.disabled}
                    onClick={() => !plan.disabled && setShowModal(true)}
                    className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-semibold text-white 
                      transition-all duration-300 transform
                      ${plan.disabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105'
                      }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>

                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase 
                    transition-all duration-300 group-hover:text-blue-600">
                    {t.included}
                  </h4>
                  
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start group/item transition-all duration-300 
                        hover:transform hover:translate-x-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 transition-transform 
                          duration-300 group-hover/item:scale-110" />
                        <span className="ml-3 text-sm text-gray-700 transition-colors 
                          duration-300 group-hover/item:text-gray-900">
                          {feature}
                        </span>
                      </li>
                    ))}
                    
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start text-gray-400 transition-all duration-300 
                        hover:transform hover:translate-x-2">
                        <X className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        <span className="ml-3 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 transition-all duration-300
                hover:text-blue-800 group relative overflow-hidden rounded-lg"
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 
                transition-all duration-300 transform origin-left group-hover:scale-x-100 scale-x-0"/>
              
              <span className="relative flex items-center gap-2 font-medium">
                <svg 
                  className="w-5 h-5 transition-transform duration-300 transform group-hover:-translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="relative transition-transform duration-300 group-hover:translate-x-1">
                  {t.backToHome}
                </span>
              </span>

              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-left
                transition-transform duration-300 scale-x-0 group-hover:scale-x-100"/>
            </Link>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleUpgrade}
        loading={loading}
      />
    </>
  );
} 