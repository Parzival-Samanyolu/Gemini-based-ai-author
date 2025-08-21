
import React, { useState } from 'react';

interface HtmlOutputProps {
  html: string;
}

const HtmlOutput: React.FC<HtmlOutputProps> = ({ html }) => {
  const [copyText, setCopyText] = useState('Copy HTML');

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy HTML'), 2000);
  };

  return (
    <div className="space-y-2">
       <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">WordPress HTML</h2>
       <div className="relative">
        <textarea
          readOnly
          value={html}
          className="w-full h-64 p-3 font-mono text-sm bg-gray-100 border border-gray-300 rounded-md shadow-inner focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          aria-label="Generated HTML for WordPress"
        />
         <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 transition-all"
        >
          {copyText}
        </button>
       </div>
    </div>
  );
};

export default HtmlOutput;
