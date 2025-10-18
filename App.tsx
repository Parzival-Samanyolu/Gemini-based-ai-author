import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Tone, Article, WordPressCredentials, PostStatus, WordPressPublicationStatus, ImageStyle, WPMedia } from './types';
import { 
  generateArticleContent, 
  generateArticleImage, 
  fetchNationalTrendingTopics, 
  fetchWorldNewsTopics, 
  fetchTechTrendingTopics, 
  fetchEconomyTopics,
  fetchHealthTopics,
  fetchScienceTopics,
  fetchEntertainmentTopics,
  fetchHoroscopeTopics, 
  fetchSportTrendingTopics 
} from './services/geminiService';
import { postToWordPress, uploadImageToWordPress } from './services/wordpressService';
import { addTitleToImage } from './services/imageService';
import Header from './components/Header';
import Controls from './components/Controls';
import ArticlePreview from './components/ArticlePreview';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';

// --- Theme Management ---
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
// --- End Theme Management ---


const AppContent: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<Tone>(Tone.Journalistic);
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Photorealistic);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [imageCredit, setImageCredit] = useState<string>('');
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [setHaberCategory, setSetHaberCategory] = useState<boolean>(true);
  const [publishStatus, setPublishStatus] = useState<WordPressPublicationStatus>(WordPressPublicationStatus.Publish);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [wordPressCreds, setWordPressCreds] = useState<WordPressCredentials>({ siteUrl: '', username: '', password: '' });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isFetchingTopics, setIsFetchingTopics] = useState<boolean>(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  
  const [postStatus, setPostStatus] = useState<PostStatus>(PostStatus.Idle);
  const [postError, setPostError] = useState<string | null>(null);

  const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState<boolean>(false);
  const [isEditorEnabled, setIsEditorEnabled] = useState<boolean>(true);

  const fetchTopics = useCallback(async (fetcher: () => Promise<string[]>) => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetcher();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchNationalTopics = useCallback(() => fetchTopics(fetchNationalTrendingTopics), [fetchTopics]);
  const handleFetchWorldNewsTopics = useCallback(() => fetchTopics(fetchWorldNewsTopics), [fetchTopics]);
  const handleFetchTechTopics = useCallback(() => fetchTopics(fetchTechTrendingTopics), [fetchTopics]);
  const handleFetchEconomyTopics = useCallback(() => fetchTopics(fetchEconomyTopics), [fetchTopics]);
  const handleFetchHealthTopics = useCallback(() => fetchTopics(fetchHealthTopics), [fetchTopics]);
  const handleFetchScienceTopics = useCallback(() => fetchTopics(fetchScienceTopics), [fetchTopics]);
  const handleFetchEntertainmentTopics = useCallback(() => fetchTopics(fetchEntertainmentTopics), [fetchTopics]);
  const handleFetchHoroscopeTopics = useCallback(() => fetchTopics(fetchHoroscopeTopics), [fetchTopics]);
  const handleFetchSportTopics = useCallback(() => fetchTopics(fetchSportTrendingTopics), [fetchTopics]);
  
  const getImagePrompt = (title: string, style: ImageStyle): string => {
    const corePrompt = `A high-quality, professional image representing the news headline: "${title}". The image must be clean, with no text or watermarks.`;
    switch (style) {
      case ImageStyle.Illustration:
        return `Style: vibrant, detailed illustration, modern digital art. ${corePrompt}`;
      case ImageStyle.DigitalArt:
        return `Style: stunning high-resolution digital art, cinematic, visually captivating. ${corePrompt}`;
      case ImageStyle.Abstract:
        return `Style: abstract artistic interpretation with bold colors and textures. ${corePrompt}`;
      case ImageStyle.Photorealistic:
      default:
        return `Style: photorealistic, professional-grade photo, as if taken by a photojournalist on location. ${corePrompt}`;
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPostStatus(PostStatus.Idle);
    setPostError(null);
    setGeneratedArticle(null);
    setIsRegeneratingImages(false);

    try {
      const articleContent = await generateArticleContent(topic, tone, includeTags);
      let imageUrls: string[] = [];
      
      if (includeImage) {
        const imagePrompt = getImagePrompt(articleContent.title, imageStyle);
        const rawImageUrls = await generateArticleImage(imagePrompt, numberOfImages);

        if (rawImageUrls.length > 0) {
           imageUrls = await Promise.all(
            rawImageUrls.map(rawUrl => addTitleToImage(rawUrl, articleContent.title, imageCredit))
          );
        }
      }

      const fullArticle: Article = { ...articleContent, imageUrls };
      setGeneratedArticle(fullArticle);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, tone, includeImage, includeTags, imageCredit, imageStyle, numberOfImages]);
  
  const handleArticleContentChange = (newContent: string) => {
    if (!generatedArticle) return;
    setGeneratedArticle(prev => prev ? { ...prev, content: newContent } : null);
  };

  const handleRegenerateImages = useCallback(async () => {
    if (!generatedArticle) return;

    setIsRegeneratingImages(true);
    setError(null);

    try {
      const imagePrompt = getImagePrompt(generatedArticle.title, imageStyle);
      const newRawImageUrls = await generateArticleImage(imagePrompt, numberOfImages);

      if (newRawImageUrls.length > 0) {
        const newImageUrlsWithTitle = await Promise.all(
          newRawImageUrls.map(rawUrl => addTitleToImage(rawUrl, generatedArticle.title, imageCredit))
        );
        setGeneratedArticle(prev => prev ? { ...prev, imageUrls: newImageUrlsWithTitle } : null);
      } else {
        setError('Could not regenerate images. The AI service might be unavailable.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during image regeneration.');
    } finally {
      setIsRegeneratingImages(false);
    }
  }, [generatedArticle, imageCredit, imageStyle, numberOfImages]);

  const handlePost = useCallback(async () => {
    if (!generatedArticle) return;

    setPostStatus(PostStatus.Idle);
    setPostError(null);
    let featuredMediaId: number | null = null;
    const articleForPost = { ...generatedArticle };
    
    try {
      // Step 1: Upload images to WP Media Library if they exist
      if (includeImage && generatedArticle.imageUrls.length > 0) {
        setPostStatus(PostStatus.UploadingImage);

        const uploadPromises = generatedArticle.imageUrls.map((imgUrl, index) => {
           const filename = `${generatedArticle.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 40)}-${index + 1}.jpg`;
           return uploadImageToWordPress(wordPressCreds, imgUrl, filename);
        });

        const uploadedMedia: WPMedia[] = await Promise.all(uploadPromises);
        
        if (uploadedMedia.length > 0) {
            featuredMediaId = uploadedMedia[0].id;

            if (uploadedMedia.length > 1) {
                const additionalImagesHtml = uploadedMedia.slice(1)
                    .map(media => `<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${generatedArticle.title}"/></figure>`)
                    .join('\n');
                
                // Insert images after the first paragraph for better layout.
                const content = articleForPost.content;
                const insertionPoint = content.indexOf('</p>');
                if (insertionPoint !== -1) {
                    const position = insertionPoint + 4; // after the </p> tag
                    articleForPost.content = content.slice(0, position) + '\n' + additionalImagesHtml + '\n' + content.slice(position);
                } else {
                    // Fallback: if no paragraph tag, prepend images so they are visible at the top.
                    articleForPost.content = additionalImagesHtml + '\n' + content;
                }
            }
        }
      }
      
      // Step 2: Post the article content with the featured media ID
      setPostStatus(PostStatus.Posting);
      await postToWordPress(wordPressCreds, articleForPost, featuredMediaId, setHaberCategory, publishStatus, scheduleDate);

      setPostStatus(PostStatus.Success);

    } catch(e) {
      setPostStatus(PostStatus.Error);
      
      let finalErrorMessage = e instanceof Error ? e.message : 'An unknown error occurred while posting.';

      // Check for specific WordPress permission errors (in English and Turkish)
      const permissionErrorKeywords = [
          "izin verilmiyor", // Turkish for "not allowed"
          "not allowed to create",
          "not allowed to edit",
          "cannot create",
          "forbidden",
          "unauthorized"
      ];

      if (permissionErrorKeywords.some(keyword => finalErrorMessage.toLowerCase().includes(keyword))) {
          finalErrorMessage = `WordPress Permission Error: The specified user cannot create or edit posts. Please check that the user has the 'Author', 'Editor' or 'Administrator' role assigned in your WordPress dashboard. Also, verify that no security plugins are blocking REST API requests. (Original error: ${finalErrorMessage})`;
      }
      
      setPostError(finalErrorMessage);
    }
  }, [generatedArticle, wordPressCreds, includeImage, setHaberCategory, publishStatus, scheduleDate]);
  
  const isPostable = wordPressCreds.siteUrl && wordPressCreds.username && wordPressCreds.password;
  
  const getPostButtonText = () => {
    switch (postStatus) {
      case PostStatus.UploadingImage: return 'Uploading Image(s)...';
      case PostStatus.Posting: return 'Posting Article...';
      default: 
        if (publishStatus === WordPressPublicationStatus.Publish && scheduleDate && new Date(scheduleDate) > new Date()) {
          return 'Schedule Post';
        }
        return publishStatus === WordPressPublicationStatus.Publish ? 'Publish to WordPress' : 'Post to WordPress as Draft';
    }
  }

  const getSuccessMessage = () => {
    if (publishStatus === WordPressPublicationStatus.Publish && scheduleDate && new Date(scheduleDate) > new Date()) {
        return "Successfully scheduled post on WordPress! Check your 'Posts' section."
    }
    return `Successfully posted to WordPress! Check your 'Posts' section for the new ${publishStatus === WordPressPublicationStatus.Publish ? 'post' : 'draft'}.`
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Controls
              topic={topic}
              setTopic={setTopic}
              tone={tone}
              setTone={setTone}
              includeImage={includeImage}
              setIncludeImage={setIncludeImage}
              imageStyle={imageStyle}
              setImageStyle={setImageStyle}
              numberOfImages={numberOfImages}
              setNumberOfImages={setNumberOfImages}
              imageCredit={imageCredit}
              setImageCredit={setImageCredit}
              includeTags={includeTags}
              setIncludeTags={setIncludeTags}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              trendingTopics={trendingTopics}
              onFetchNationalTopics={handleFetchNationalTopics}
              onFetchWorldNewsTopics={handleFetchWorldNewsTopics}
              onFetchTechTopics={handleFetchTechTopics}
              onFetchEconomyTopics={handleFetchEconomyTopics}
              onFetchHealthTopics={handleFetchHealthTopics}
              onFetchScienceTopics={handleFetchScienceTopics}
              onFetchEntertainmentTopics={handleFetchEntertainmentTopics}
              onFetchHoroscopeTopics={handleFetchHoroscopeTopics}
              onFetchSportTopics={handleFetchSportTopics}
              isFetchingTopics={isFetchingTopics}
              wordPressCreds={wordPressCreds}
              setWordPressCreds={setWordPressCreds}
              setHaberCategory={setHaberCategory}
              setSetHaberCategory={setSetHaberCategory}
              publishStatus={publishStatus}
              setPublishStatus={setPublishStatus}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              isEditorEnabled={isEditorEnabled}
              setIsEditorEnabled={setIsEditorEnabled}
            />
          </div>
          <div className="lg:col-span-8 space-y-6">
            {isLoading && <Loader />}
            {error && <ErrorDisplay message={error} />}
            {generatedArticle && (
              <>
                <ArticlePreview 
                  article={generatedArticle}
                  onContentChange={handleArticleContentChange}
                  onRegenerateImages={handleRegenerateImages}
                  isRegeneratingImages={isRegeneratingImages}
                  isEditorEnabled={isEditorEnabled}
                />
                {isPostable && (
                  <div className="mt-6">
                     <button
                        onClick={handlePost}
                        disabled={postStatus === PostStatus.Posting || postStatus === PostStatus.UploadingImage}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-500/50 disabled:cursor-not-allowed transition-colors"
                     >
                        {getPostButtonText()}
                     </button>
                     {postStatus === PostStatus.Success && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{getSuccessMessage()}</p>}
                     {postStatus === PostStatus.Error && postError && <ErrorDisplay message={postError} />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;