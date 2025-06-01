import React from 'react';
import { User } from 'lucide-react';
import type { ProfileImageProps } from '../types';

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-32 h-32'
};

export function ProfileImage({ url, alt, size = 'md', className = '' }: ProfileImageProps) {
  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      {url ? (
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <User className={`${size === 'lg' ? 'w-16 h-16' : 'w-8 h-8'} text-gray-400`} />
        </div>
      )}
    </div>
  );
}