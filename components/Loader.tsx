import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fadeIn">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-xl animate-pulse-slow"></div>
        <div className="relative h-12 w-12">
           <svg className="animate-spin text-white w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path fill="url(#gemini-gradient)" d="M12,0 L14,10 L24,12 L14,14 L12,24 L10,14 L0,12 L10,10 L12,0 Z" />
              <defs>
                <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F83F6" />
                  <stop offset="50%" stopColor="#9F55FF" />
                  <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
              </defs>
           </svg>
        </div>
      </div>
      
      <div className="text-center space-y-1">
          <p className="text-lg font-medium text-white tracking-tight">Constructing Article</p>
          <p className="text-sm text-gray-400">Gemini 3 Pro is researching & writing...</p>
      </div>
    </div>
  );
};

export default Loader;