// project/src/components/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import type { UserProfile } from '../types'; // Assuming UserProfile is in types

interface SplashScreenProps {
  splashGif?: string;
  userProfile: UserProfile | null;
  isLoading: boolean;
  companyName?: string;
}

export function SplashScreen({ splashGif, userProfile, isLoading, companyName = "BuggyCompany" }: SplashScreenProps) {
  const [showScreen, setShowScreen] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // If not app loading (initial determination phase) and not onboarding, then start splash timer
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShowScreen(false);
        }, 1000); // Fade out duration
      }, 2000); // Visible duration
      return () => clearTimeout(timer);
    }
  }, [isLoading]); // Only react to isLoading state

   useEffect(() => {
    const calculateScale = () => {
      const container = document.querySelector('.company-name-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const textWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 0;
        if (textWidth > containerWidth && containerWidth > 0) { // ensure containerWidth is not 0
          setScale(containerWidth / textWidth);
        } else {
          setScale(1);
        }
      }
    };

    calculateScale(); // Initial calculation
    const timeoutId = setTimeout(calculateScale, 100); // Recalculate after a short delay for dynamic content
    window.addEventListener('resize', calculateScale);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateScale);
    };
  }, [companyName, userProfile, isLoading]); // Recalculate if these change

  if (!showScreen && !isLoading) return null; // Don't show if not loading and exit timer passed

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
      isExiting && !isLoading ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="relative w-full h-full">
        {splashGif ? (
          <img
            src={splashGif}
            alt="Splash Screen"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-gradient" />
        )}
        
        {/* User Info and Loading Indicator */}
        <div className={`absolute top-8 right-8 transition-all duration-1000 p-4 bg-black/30 backdrop-blur-sm rounded-lg ${
            isExiting || isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-lg text-white">Loading...</span>
            </div>
          ) : userProfile ? (
            <div className="flex items-center gap-3">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.nickname} className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center border-2 border-white/50">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm text-white/80">Logged in as</p>
                <p className="text-lg font-semibold text-white">{userProfile.nickname}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Company Name */}
        <div className="absolute bottom-8 left-8 company-name-container max-w-[calc(100%-4rem)]"> {/* Ensure it doesn't overflow */}
          <div
            className={`transition-all duration-1000 ${
              isExiting || isLoading ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{ transform: `scale(${scale})`, transformOrigin: 'left bottom' }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wider mb-2 md:mb-3 whitespace-nowrap">
              {companyName}
            </h1>
            <p className="text-white text-base md:text-lg opacity-90">Created by {companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}