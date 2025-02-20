import React, { useEffect } from 'react';
import { Menu, Car, MapPin, Settings, Navigation2, LogOut, CreditCard, Globe, Crown } from 'lucide-react';
import { useParkingStore } from '../store/parkingStore';
import { ParkingSpotSize, ParkingSpot } from '../types';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculateDistance } from '../utils/distance';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../utils/translations';
import { AccountSettingsModal } from './AccountSettingsModal';
import { useSubscriptionStore } from '../store/subscriptionStore';

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 3, label: '3 km' },
  { value: 10, label: '10 km' },
];

const SPOT_SIZES: { value: ParkingSpotSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState<ParkingSpotSize>('medium');
  const userLocation = useParkingStore((state) => state.userLocation);
  const selectedDistance = useParkingStore((state) => state.selectedDistance);
  const setSelectedDistance = useParkingStore((state) => state.setSelectedDistance);
  const setSelectedSpot = useParkingStore((state) => state.setSelectedSpot);
  const getVisibleSpots = useParkingStore((state) => state.getVisibleSpots);
  const { signOut } = useAuthStore();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = React.useState({
    nearbySpots: false
  });
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];
  const { fetchSubscriptionStatus, status, endDate } = useSubscriptionStore();

  // Add a state to force re-render
  const [, setForceUpdate] = React.useState(0);

  // Add state to track spots updates
  const [spotUpdateTrigger, setSpotUpdateTrigger] = React.useState(0);

  // Subscribe to store changes
  React.useEffect(() => {
    const unsubscribe = useParkingStore.subscribe((state, prevState) => {
      // Check if spots or delayedSpots changed
      if (state.spots !== prevState.spots || state.delayedSpots !== prevState.delayedSpots) {
        setSpotUpdateTrigger(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSpots = React.useMemo(() => {
    const visibleSpots = getVisibleSpots();
    if (!userLocation) return visibleSpots;
    
    return visibleSpots.filter(spot => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      );
      return distance <= selectedDistance;
    });
  }, [userLocation, selectedDistance, getVisibleSpots, spotUpdateTrigger]);

  const handleUnpark = () => {
    if (!userLocation) return;
    
    const newSpot = {
      id: Date.now().toString(),
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      size: selectedSize,
      isAccessible: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1800000, // 30 minutes
      userId: user?.id || 'anonymous',
      userName: user?.user_metadata?.name
    };

    useParkingStore.getState().addSpot(newSpot);
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${spot.latitude},${spot.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getSpotDistance = (spot: ParkingSpot): string => {
    if (!userLocation) return '';
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      spot.latitude,
      spot.longitude
    );
    return distance.toFixed(1);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleNotificationChange = async (type: keyof typeof notifications) => {
    if (type === 'nearbySpots') {
      if (!notifications.nearbySpots) {
        // Ζητάμε άδεια για notifications όταν ο χρήστης ενεργοποιεί την επιλογή
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
        } else {
          alert('Παρακαλώ επιτρέψτε τις ειδοποιήσεις για να λαμβάνετε ενημερώσεις για κοντινές θέσεις.');
          return;
        }
      } else {
        setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
      }
    }
  };

  // Παρακολούθηση για νέες θέσεις
  React.useEffect(() => {
    if (!notifications.nearbySpots || !userLocation) return;

    const checkNewSpots = (newSpot: ParkingSpot) => {
      if (!userLocation) return;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        newSpot.latitude,
        newSpot.longitude
      );

      // Αν η νέα θέση είναι εντός της επιλεγμένης ακτίνας
      if (distance <= selectedDistance) {
        // Δημιουργία και εμφάνιση notification
        new Notification('Νέα θέση στάθμευσης!', {
          body: `Βρέθηκε νέα θέση ${distance.toFixed(1)}km μακριά`,
          icon: '/assets/plogomain.png',
          tag: 'parking-spot', // Για να αποφύγουμε πολλαπλές ειδοποιήσεις
          requireInteraction: true // Η ειδοποίηση παραμένει μέχρι ο χρήστης να αλληλεπιδράσει
        });
      }
    };

    // Εγγραφή στο store για παρακολούθηση νέων θέσεων
    const unsubscribe = useParkingStore.subscribe(
      (state, prevState) => {
        const newSpots = state.spots.filter(
          spot => !prevState.spots.find(s => s.id === spot.id)
        );
        newSpots.forEach(checkNewSpots);
      }
    );

    return () => unsubscribe();
  }, [notifications.nearbySpots, userLocation, selectedDistance]);

  const toggleLanguage = () => {
    setLanguage(language === 'el' ? 'en' : 'el');
  };

  useEffect(() => {
    fetchSubscriptionStatus().catch(console.error);
  }, [fetchSubscriptionStatus]);

  return (
    <>
      <div className="relative">
        <div className={`bg-white h-full shadow-lg transition-all ${isOpen ? 'w-80' : 'w-16'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <div className={`${!isOpen && 'hidden'}`}>
              <img
                src="/assets/plogomain.png"
                alt="e-Parking Logo"
                className="h-24 w-auto"
              />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Premium Notice - Moved here */}
          {status !== 'premium' && (
            <div className="px-4 py-2 bg-yellow-50 text-xs text-yellow-700 border-b">
              {t.premiumNotice}
            </div>
          )}

          {/* Account Status */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Crown className={`w-4 h-4 ${status === 'premium' ? 'text-yellow-500' : 'text-gray-400'}`} />
              {isOpen && (
                <span className={`text-xs font-medium ${status === 'premium' ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {status === 'premium' ? t.premiumAccount : t.freeAccount}
                </span>
              )}
            </div>
            {isOpen && status === 'premium' && endDate && (
              <p className="text-xs text-gray-400 mt-0.5 pl-6">
                {t.validUntil}: {new Date(endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Rest of the sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                {SPOT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all transform hover:scale-105 ${
                      selectedSize === size.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                        : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    {t[size.value]}
                  </button>
                ))}
              </div>

              <button
                onClick={handleUnpark}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 
                hover:bg-blue-700 transition-all transform hover:scale-102 shadow-md hover:shadow-lg shadow-blue-200"
              >
                <Car size={20} />
                {t.unpark}
              </button>

              <div className="mt-6 mb-24">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.distanceFilter}
                  </label>
                  <select
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {DISTANCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t.upTo} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <h2 className="font-semibold mb-3">
                  {t.nearbySpots} ({filteredSpots.length})
                </h2>
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                  {filteredSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => handleSpotClick(spot)}
                      className="w-full p-3 bg-gray-50 rounded-lg transition-all transform hover:scale-102
                      hover:bg-white hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span className="font-medium">
                            {spot.userName ? spot.userName : `Spot ${spot.id.slice(-6)}`}
                          </span>
                        </div>
                        <Navigation2 size={16} className="text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          {t[spot.size]}
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            spot.size === 'small' ? 'bg-red-500' : 
                            spot.size === 'medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`} />
                          · {spot.isAccessible ? t.accessible : t.standard}
                        </span>
                        <span className="text-blue-600 font-medium">
                          {getSpotDistance(spot)} {t.kmAway}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="absolute bottom-0 w-full border-t bg-white">
            <button
              onClick={toggleLanguage}
              className="p-4 w-full hover:bg-gray-50 flex items-center gap-2 text-gray-600 border-b
              transition-all hover:shadow-inner"
            >
              <Globe size={20} />
              {isOpen && <span>{language === 'el' ? 'English' : 'Ελληνικά'}</span>}
            </button>

            <button
              onClick={handleSettingsClick}
              className={`p-4 w-full flex items-center gap-2 text-gray-600 border-b
              transition-all duration-300 ease-in-out
              ${showSettings 
                ? 'bg-blue-50 scale-[1.03] shadow-lg ring-2 ring-blue-300 z-10 -translate-y-0.5' 
                : 'hover:bg-gray-50 hover:scale-[1.01] hover:shadow-sm'
              }`}
            >
              <Settings 
                size={20} 
                className={`transition-transform duration-300 ${showSettings ? 'rotate-180 text-blue-600' : ''}`}
              />
              {isOpen && (
                <span className={`transition-all duration-300 ${
                  showSettings 
                    ? 'text-blue-600 font-medium transform translate-x-1' 
                    : ''
                }`}>
                  {t.settings}
                </span>
              )}
            </button>

            <Link 
              to="/pricing"
              className="p-4 w-full flex items-center gap-2 text-blue-600 border-b
              transition-all duration-300 ease-in-out
              hover:bg-blue-50 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-0.5
              hover:ring-2 hover:ring-blue-200 relative group z-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"/>
              <CreditCard 
                size={20} 
                className="transition-transform duration-300 group-hover:scale-110 relative z-10"
              />
              {isOpen && (
                <span className="relative z-10 font-medium transition-all duration-300 
                  group-hover:translate-x-1 group-hover:text-blue-700">
                  {t.upgradeToPremium}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-blue-400/5 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-x"/>
            </Link>

            <button 
              onClick={signOut}
              className="p-4 w-full hover:bg-gray-50 flex items-center gap-2 text-red-600
              transition-all hover:shadow-inner"
            >
              <LogOut size={20} />
              {isOpen && <span>{t.logout}</span>}
            </button>
          </div>
        </div>
      </div>
      <AccountSettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}