import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../utils/translations';

export function Cancel() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.paymentCancelled}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.paymentCancelledMessage}
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            ← {t.backToPricing}
          </button>
        </div>
      </div>
    </div>
  );
} 