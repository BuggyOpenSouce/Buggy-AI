import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import type { ProfileBannerProps } from '../types';

export function ProfileBanner({ url, onUpload }: ProfileBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative h-48 overflow-hidden">
      {url ? (
        <img
          src={url}
          alt="Profile Banner"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
      >
        <Camera className="w-5 h-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}