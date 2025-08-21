import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 md:py-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          AI News Publisher for WordPress
        </h1>
        <p className="text-gray-500 mt-1">
          Fetch trending topics and post articles directly to your site
        </p>
      </div>
    </header>
  );
};

export default Header;