import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  error: Error | null;
}

export function ErrorScreen({ error }: ErrorScreenProps) {
  const errorCode = Math.floor(Math.random() * 900000) + 100000;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            Error Code: {errorCode}
            {error && (
              <>
                <br />
                <span className="text-red-600 dark:text-red-400">
                  {error.message}
                </span>
              </>
            )}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh Page</span>
        </button>
      </div>
    </div>
  );
}