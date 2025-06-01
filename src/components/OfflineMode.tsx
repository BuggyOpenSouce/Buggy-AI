import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineModeProps {
  isOffline: boolean;
}

export function OfflineMode({ isOffline }: OfflineModeProps) {
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50">
      <WifiOff className="w-5 h-5" />
      <span>Çevrimdışı mod - İnternet bağlantınız yok</span>
    </div>
  );
}