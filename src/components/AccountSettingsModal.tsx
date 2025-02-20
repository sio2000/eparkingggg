import React from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../utils/translations';
import { ChangePasswordModal } from './settings/ChangePasswordModal';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [name, setName] = React.useState(user?.user_metadata?.name || '');
  const [loading, setLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    nearbySpots: true
  });
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);

  if (!isOpen) return null;

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t.deleteConfirmation)) {
      // Delete account logic
    }
  };

  const handleNotificationToggle = async () => {
    try {
      if (!notifications.nearbySpots) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifications(prev => ({ ...prev, nearbySpots: true }));
          alert(t.notificationsEnabled);
        } else {
          alert(t.allowNotifications);
        }
      } else {
        setNotifications(prev => ({ ...prev, nearbySpots: false }));
        alert(t.notificationsDisabled);
      }
    } catch (error) {
      alert(t.errorOccurred);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center overflow-auto">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{t.accountSettings}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              {t.close}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">{t.editProfile}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">{t.notificationSettings}</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">{t.nearbyNotifications}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={notifications.nearbySpots}
                      onChange={handleNotificationToggle}
                      disabled={loading}
                    />
                    <div
                      className={`block w-14 h-8 rounded-full transition-colors ${
                        notifications.nearbySpots ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        notifications.nearbySpots ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              </div>
            </div>

            <button
              className="w-full border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50"
              onClick={handlePasswordChange}
            >
              {t.changePassword}
            </button>

            <button
              className="w-full border border-red-600 text-red-600 py-2 rounded-md hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              {t.deleteAccount}
            </button>
          </div>
        </div>
      </div>
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
} 