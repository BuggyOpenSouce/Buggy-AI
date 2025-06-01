// project/src/components/ProfileSetup.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { generateBUID } from '../utils/auth';

interface ProfileSetupProps {
  email: string;
  photoURL?: string;
  currentBuid?: string; // Pass BUID if already generated
  onComplete: (profile: UserProfile) => void;
  onClose: () => void;
}

export function ProfileSetup({ email, photoURL, currentBuid, onComplete, onClose }: ProfileSetupProps) {
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(photoURL);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleComplete = () => {
    if (!nickname.trim() || !birthDate) return;

    const profile: UserProfile = {
      buid: currentBuid || generateBUID(nickname), // Use existing BUID or generate new
      nickname: nickname.trim(),
      birthDate,
      interests,
      photoURL: profilePhoto,
      lastUpdated: Date.now(),
      isProfileComplete: true,
      email
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4"> {/* Increased z-index */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Complete Your Profile
        </h2>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white cursor-pointer hover:bg-blue-600 transition-colors">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="Add an interest"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAddInterest}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={!nickname.trim() || !birthDate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              <span>Complete Profile</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}