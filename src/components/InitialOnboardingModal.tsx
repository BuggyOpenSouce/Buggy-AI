// project/src/components/InitialOnboardingModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, LogIn } from 'lucide-react';

interface InitialOnboardingModalProps {
  onGoogleSignIn: () => void;
  onGuestLogin: () => void;
}

export function InitialOnboardingModal({ onGoogleSignIn, onGuestLogin }: InitialOnboardingModalProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to BuggyAI!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to personalize your experience or continue as a guest.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-md"
          >
            <img
              src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
              alt="Google"
              className="w-6 h-6"
            />
            <span>Sign in with Google</span>
          </button>
          <button
            onClick={onGuestLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 shadow-md"
          >
            <User className="w-6 h-6" />
            <span>Continue as Guest</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}