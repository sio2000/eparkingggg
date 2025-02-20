import React from 'react';
import { X, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [name, setName] = React.useState(user?.user_metadata?.name || '');
  const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState(user?.user_metadata?.avatar_url || '');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Εδώ η λογική για την ενημέρωση του προφίλ
      setSuccess(t.successUpdate);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t.errorUpdating);
    }
  };

  const handleChangePassword = () => {
    // Εδώ θα προσθέσετε τη λογική για την αλλαγή κωδικού
    console.log('Change password clicked');
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t.deleteConfirm)) {
      // Εδώ η λογική για τη διαγραφή λογαριασμού
      console.log('Deleting account');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-bold">{t.accountSettings}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewUrl || 'https://via.placeholder.com/100'}
                alt={t.profilePicture}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <User size={16} className="text-white" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
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

          {error && (
            <div className="bg-red-50 p-3 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 p-3 rounded-md text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Update Profile Button */}
          <button
            onClick={handleUpdateProfile}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {t.updateProfile}
          </button>

          {/* Change Password */}
          <button
            onClick={handleChangePassword}
            className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50"
          >
            {t.changePassword}
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            className="w-full border border-red-600 text-red-600 py-2 px-4 rounded-md hover:bg-red-50"
          >
            {t.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  );
} 