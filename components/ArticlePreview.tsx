import React, { useRef, useEffect, useState } from 'react';
import { Article } from '../types';
import HtmlOutput from './HtmlOutput';

interface ArticlePreviewProps {
  article: Article;
  onContentChange: (newContent: string) => void;
  onRegenerateImages?: () => void;
  isRegeneratingImages?: boolean;
  isEditorEnabled: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onContentChange, onRegenerateImages, isRegeneratingImages, isEditorEnabled }) => {
  const [showHtml, setShowHtml] = useState(false);
  const hasImages = article.imageUrls && article.imageUrls.length > 0;
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== article.content) {
      editor.innerHTML = article.content;
    }
  }, [article.content]);

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };
  
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onContentChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="space-y-8">
       {/* Media Card */}
       {hasImages && (
        <div className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl ring-1 ring-white/10">
           <div className="aspect-video w-full overflow-hidden">
             <img 
               src={article.imageUrls[0]} 
               alt={article.title} 
               className="h-full w-full object-cover transition duration-700 group-hover:scale-105 opacity-90 hover:opacity-100"
             />
           </div>
           
           <div className="absolute top-4 right-4 flex gap-2">
             <button
               onClick={onRegenerateImages}
               disabled={isRegeneratingImages}
               className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/20 hover:bg-black/80 transition-all"
             >
               {isRegeneratingImages ? (
                 <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : (
                 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               )}
               Regenerate Visual
             </button>
           </div>

           {article.imageUrls.length > 1 && (
             <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2">
               {article.imageUrls.slice(1).map((url, i) => (
                 <img key={i} src={url} className="h-16 w-24 flex-none rounded-lg object-cover shadow-md ring-1 ring-white/20" alt={`Gallery ${i}`} />
               ))}
             </div>
           )}
        </div>
       )}

       {/* Editor / Article Card */}
       <div className="rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/5 bg-white/5 p-6">
             <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
               {article.title}
             </h1>
             <div className="mt-4 flex flex-wrap items-center gap-3">
                {article.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                    #{tag}
                  </span>
                ))}
             </div>
          </div>

          {/* Toolbar */}
          {isEditorEnabled && !showHtml && (
            <div className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto border-b border-white/5 bg-gray-800/80 backdrop-blur-md p-2">
              <ToolbarButton onClick={() => execCmd('bold')} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h10a4 4 0 110 8H6v-8z" />} label="Bold" />
              <ToolbarButton onClick={() => execCmd('italic')} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />} label="Italic" />
              <div className="mx-1 h-4 w-px bg-white/10" />
              <ToolbarButton onClick={() => execCmd('formatBlock', 'H2')} label="H2" text />
              <ToolbarButton onClick={() => execCmd('formatBlock', 'H3')} label="H3" text />
              <div className="mx-1 h-4 w-px bg-white/10" />
              <ToolbarButton onClick={() => execCmd('insertUnorderedList')} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />} label="List" />
              <ToolbarButton onClick={() => execCmd('insertOrderedList')} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />} label="Ordered" />
              <ToolbarButton onClick={() => execCmd('formatBlock', 'blockquote')} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />} label="Quote" />
            </div>
          )}

          {/* Content Area */}
          <div className="p-6 md:p-8 min-h-[400px]">
             {showHtml ? (
               <HtmlOutput html={article.content} />
             ) : (
               <div
                ref={editorRef}
                contentEditable={isEditorEnabled}
                onInput={handleContentInput}
                className={`prose prose-invert prose-lg max-w-none focus:outline-none ${
                    isEditorEnabled ? 'cursor-text' : 'cursor-default'
                }`}
               />
             )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-white/5 bg-black/20 p-4 flex justify-end">
            <button 
              onClick={() => setShowHtml(!showHtml)}
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              {showHtml ? 'Switch to Visual Editor' : 'View Source Code'}
            </button>
          </div>
       </div>
       
       {/* Sources/Citations */}
       {article.sources && article.sources.length > 0 && (
         <div className="rounded-xl bg-gray-900/40 border border-white/5 p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Gemini Grounding Sources</h4>
            <ul className="space-y-2">
              {article.sources.map((source, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                   <span className="text-blue-500 mt-0.5">•</span>
                   <a href={source.uri} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate max-w-md">
                     {source.title || source.uri}
                   </a>
                </li>
              ))}
            </ul>
         </div>
       )}
    </div>
  );
};

const ToolbarButton = ({ onClick, icon, label, text = false }: { onClick: () => void, icon?: React.ReactNode, label: string, text?: boolean }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors ${text ? 'font-bold text-xs w-8 h-8 flex items-center justify-center' : ''}`}
        title={label}
    >
        {text ? label : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        )}
    </button>
);

export default ArticlePreview;