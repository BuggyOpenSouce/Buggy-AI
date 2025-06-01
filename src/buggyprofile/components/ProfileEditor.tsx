import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Trash2, Save } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileEditor({ isOpen, onClose, userProfile, onUpdateProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newInterest, setNewInterest] = useState('');
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, bannerURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      lastUpdated: Date.now()
    });
    onClose();
  };

  if (!isOpen) return null;

  const editorBackground = profile.bannerURL 
    ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${profile.bannerURL})`
    : 'linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl"
        style={{
          background: editorBackground,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="backdrop-blur-md bg-white/30 dark:bg-black/30">
          <div className="relative">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </div>

            <div className="h-48 bg-gradient-to-r from-blue-500/50 to-purple-600/50" />
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-white/10">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white/70" />
                  </div>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-blue-500/70 text-white hover:bg-blue-600/70 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-white/30 text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-white/30 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    placeholder="Add an interest"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-white/30 text-white placeholder-white/50"
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500/70 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {interest}
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500/70 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}