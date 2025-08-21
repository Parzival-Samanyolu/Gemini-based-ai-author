import React from 'react';
import { Article } from '../types';

interface ArticlePreviewProps {
  article: Article;
  onRegenerateImage?: () => void;
  isRegeneratingImage?: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onRegenerateImage, isRegeneratingImage }) => {
  return (
    <div className="prose prose-indigo lg:prose-lg max-w-none">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Article Preview</h2>
      <div className="mt-2 border rounded-lg bg-gray-50/50 not-prose">
        
        {/* Combined Image and Title Header */}
        {article.imageUrl ? (
          <div className="relative rounded-t-lg overflow-hidden shadow-lg -mt-px -ml-px -mr-px">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className={`w-full h-64 md:h-80 object-cover transition-opacity duration-300 ${isRegeneratingImage ? 'opacity-50' : 'opacity-100'}`}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl text-white font-bold !my-0 leading-tight" style={{ textShadow: '1px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                    {article.title}
                </h1>
            </div>
            
            {isRegeneratingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="flex flex-col items-center justify-center space-y-2 text-white bg-gray-900 bg-opacity-70 p-4 rounded-lg">
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-medium">Regenerating...</p>
                </div>
              </div>
            )}
            {onRegenerateImage && !isRegeneratingImage && (
              <button
                onClick={onRegenerateImage}
                disabled={isRegeneratingImage}
                className="absolute top-3 right-3 flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gray-900 bg-opacity-60 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all disabled:cursor-not-allowed"
                aria-label="Regenerate image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Regenerate
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 border-b">
            <h1 className="text-2xl md:text-3xl !my-0 prose">{article.title}</h1>
          </div>
        )}
        
        <div className="p-4 space-y-6">
          {/* Meta Description */}
          {article.metaDescription && (
             <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider !my-0">SEO Meta Description</h3>
                <p className="text-sm text-gray-600 !mt-1">{article.metaDescription}</p>
             </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
             <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider !my-0">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>
          )}
          
          {/* Content */}
          <div className="prose prose-indigo lg:prose-lg max-w-none text-gray-800">
          {article.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticlePreview;
