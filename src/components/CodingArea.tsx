import React, { useState } from 'react';
import { X, Copy, Terminal, Play } from 'lucide-react';

interface CodingAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (code: string) => void;
}

export function CodingArea({ isOpen, onClose, onExecute }: CodingAreaProps) {
  const [code, setCode] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(code);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[600px] transform overflow-hidden bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <span className="text-lg font-semibold text-white">Code Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={handleExecute}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Play className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none bg-gray-900 p-4 font-mono text-sm text-gray-100 focus:outline-none"
              placeholder="Write your code here..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}