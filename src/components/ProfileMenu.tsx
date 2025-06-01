import React, { useState } from 'react';
import { X, Camera, User, Edit2, Terminal, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '../types';
import { signInWithGoogle, signOut } from '/home/project/src/utils/auth.ts';
import { ProfileEditor } from './ProfileEditor';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onOpenDevSettings: () => void;
}

export function ProfileMenu({ isOpen, onClose, userProfile, onUpdateProfile, onOpenDevSettings }: ProfileMenuProps) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  if (!isOpen) return null;

  const showDevOptions = userProfile?.nickname?.toLowerCase() === 'buggydosplus';

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        onUpdateProfile({
          buid: user.uid,
          nickname: user.displayName || 'User',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          interests: [],
          birthDate: '',
          lastUpdated: Date.now(),
          isProfileComplete: true
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onUpdateProfile({} as UserProfile);
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuBackground = userProfile?.bannerURL 
    ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${userProfile.bannerURL})`
    : 'linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))';

  return (
    <AnimatePresence>
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
          className="w-full max-w-md overflow-hidden rounded-2xl"
          style={{
            background: menuBackground,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="backdrop-blur-md bg-white/30 dark:bg-black/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Profile
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {userProfile?.isProfileComplete ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {userProfile.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.nickname}
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-white/20"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
                          <User className="w-10 h-10 text-white/70" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white">
                        {userProfile.nickname}
                      </h3>
                      <p className="text-sm text-white/70">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowProfileEditor(true)}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>

                    {showDevOptions && (
                      <button
                        onClick={onOpenDevSettings}
                        className="w-full px-4 py-2 bg-purple-500/50 text-white rounded-lg hover:bg-purple-500/70 transition-colors flex items-center justify-center gap-2"
                      >
                        <Terminal className="w-5 h-5" />
                        <span>Developer Options</span>
                      </button>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 bg-red-500/50 text-white rounded-lg hover:bg-red-500/70 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <img
                      src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                      alt="Google"
                      className="w-6 h-6"
                    />
                    <span className="text-white font-medium">
                      Sign in with Google
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {showProfileEditor && userProfile && (
          <ProfileEditor
            isOpen={true}
            onClose={() => setShowProfileEditor(false)}
            userProfile={userProfile}
            onUpdateProfile={onUpdateProfile}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}