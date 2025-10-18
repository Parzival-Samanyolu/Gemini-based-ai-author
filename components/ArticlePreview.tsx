
import React, { useRef, useEffect } from 'react';
import { Article } from '../types';

interface ArticlePreviewProps {
  article: Article;
  onContentChange: (newContent: string) => void;
  onRegenerateImages?: () => void;
  isRegeneratingImages?: boolean;
  isEditorEnabled: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onContentChange, onRegenerateImages, isRegeneratingImages, isEditorEnabled }) => {
  const hasImages = article.imageUrls && article.imageUrls.length > 0;
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external changes (like article regeneration) to the editor,
  // but avoid resetting the content if it's identical, which would cause cursor jumps.
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== article.content) {
      editor.innerHTML = article.content;
    }
  }, [article.content]);

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };
  
  // Use the legacy document.execCommand for rich text actions, as it requires no external dependencies.
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if(editorRef.current) {
        editorRef.current.focus();
        // Manually trigger input event after execCommand to ensure React state updates.
        onContentChange(editorRef.current.innerHTML);
    }
  }

  const toolbarButtonStyles = "p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500";


  return (
    <div className="prose prose-indigo lg:prose-lg max-w-none dark:prose-invert">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article Preview</h2>
      <div className="mt-2 border dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 not-prose transition-colors duration-300">
        
        {hasImages ? (
          <div>
            {/* Main Image */}
            <div className="relative rounded-t-lg overflow-hidden shadow-lg -mt-px -ml-px -mr-px">
              <img 
                src={article.imageUrls[0]} 
                alt={article.title} 
                className={`w-full h-64 md:h-80 object-cover transition-opacity duration-300 ${isRegeneratingImages ? 'opacity-50' : 'opacity-100'}`}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <h1 className="text-3xl md:text-4xl text-white font-bold !my-0 leading-tight" style={{ textShadow: '1px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                      {article.title}
                  </h1>
              </div>
              
              {isRegeneratingImages && (
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
              {onRegenerateImages && !isRegeneratingImages && (
                <button
                  onClick={onRegenerateImages}
                  disabled={isRegeneratingImages}
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

            {/* Additional Images Gallery */}
            {article.imageUrls.length > 1 && (
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700">
                {article.imageUrls.slice(1).map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-w-16 aspect-h-9">
                    <img 
                      src={url} 
                      alt={`${article.title} - image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-2xl md:text-3xl !my-0 prose dark:prose-invert">{article.title}</h1>
          </div>
        )}
        
        <div className="p-4 space-y-6">
          {/* Meta Description */}
          {article.metaDescription && (
             <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider !my-0">SEO Meta Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 !mt-1">{article.metaDescription}</p>
             </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
             <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider !my-0">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>
          )}
          
          {/* Content Editor */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider !my-0 mb-2">
              Article Content {isEditorEnabled ? '(Editable)' : '(Preview)'}
            </h3>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
              {isEditorEnabled && (
                <div className="flex items-center p-1 border-b border-gray-300 dark:border-gray-600 space-x-1">
                  <button onClick={() => execCmd('bold')} title="Bold" className={toolbarButtonStyles}><strong className="font-bold">B</strong></button>
                  <button onClick={() => execCmd('italic')} title="Italic" className={toolbarButtonStyles}><em className="italic">I</em></button>
                  <button onClick={() => execCmd('underline')} title="Underline" className={toolbarButtonStyles}><u className="underline">U</u></button>
                  <button onClick={() => execCmd('formatBlock', '<h2>')} title="Heading 2" className={`${toolbarButtonStyles} font-semibold text-sm`}>H2</button>
                  <button onClick={() => execCmd('formatBlock', '<h3>')} title="Heading 3" className={`${toolbarButtonStyles} font-semibold text-sm`}>H3</button>
                  <button onClick={() => execCmd('formatBlock', '<p>')} title="Paragraph" className={`${toolbarButtonStyles} text-sm`}>P</button>
                  <button onClick={() => execCmd('insertUnorderedList')} title="Bullet List" className={toolbarButtonStyles}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                  </button>
                </div>
              )}
              <div
                ref={editorRef}
                onInput={handleContentInput}
                contentEditable={isEditorEnabled}
                suppressContentEditableWarning={true}
                className={`prose prose-indigo lg:prose-lg max-w-none text-gray-800 dark:prose-invert p-4 focus:outline-none min-h-[200px] ${!isEditorEnabled ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>

          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider !my-0">Sources</h3>
                <ul className="list-none !pl-0 mt-2 space-y-1">
                  {article.sources.map((source, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                        title={source.title}
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArticlePreview;