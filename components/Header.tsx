import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B101B]/70 border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo Icon */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M9.375 3a.375.375 0 0 1 .375.375 7.5 7.5 0 0 0 7.5 7.5.375.375 0 0 1 0 .75 7.5 7.5 0 0 0-7.5 7.5.375.375 0 0 1-.75 0 7.5 7.5 0 0 0-7.5-7.5.375.375 0 0 1 0-.75 7.5 7.5 0 0 0 7.5-7.5A.375.375 0 0 1 9.375 3ZM16.5 15.75a.375.375 0 0 1 .375-.375 3.75 3.75 0 0 0 3.75-3.75.375.375 0 0 1 .75 0 3.75 3.75 0 0 0-3.75 3.75.375.375 0 0 1-.75 0ZM16.5 7.5a.375.375 0 0 1-.375.375 3.75 3.75 0 0 0-3.75 3.75.375.375 0 0 1 0 .75 3.75 3.75 0 0 0 3.75-3.75.375.375 0 0 1 .375-.375Z" />
            </svg>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-bold tracking-tight text-white">
              Gemini <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">News Architect</span>
            </h1>
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                    Gemini 3 Pro
                </span>
                <span className="inline-flex items-center rounded-full bg-pink-400/10 px-2 py-0.5 text-xs font-medium text-pink-400 ring-1 ring-inset ring-pink-400/20">
                    Imagen 4
                </span>
            </div>
          </div>
        </div>
        
        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
          Documentation
        </a>
      </div>
    </header>
  );
};

export default Header;