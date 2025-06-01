import React from 'react';
import packageJson from '../../package.json';

export function VersionDisplay() {
  return (
    <div className="fixed bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
      v{packageJson.version}
    </div>
  );
}