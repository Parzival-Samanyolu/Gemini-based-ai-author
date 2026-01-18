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
type Theme = 'dark'; // Enforcing dark theme for Gemini aesthetic

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

  // Force dark class on body
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
        setError('Could not regenerate images. Gemini might be unavailable.');
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
                
                const content = articleForPost.content;
                const insertionPoint = content.indexOf('</p>');
                if (insertionPoint !== -1) {
                    const position = insertionPoint + 4;
                    articleForPost.content = content.slice(0, position) + '\n' + additionalImagesHtml + '\n' + content.slice(position);
                } else {
                    articleForPost.content = additionalImagesHtml + '\n' + content;
                }
            }
        }
      }
      
      setPostStatus(PostStatus.Posting);
      await postToWordPress(wordPressCreds, articleForPost, featuredMediaId, setHaberCategory, publishStatus, scheduleDate);

      setPostStatus(PostStatus.Success);

    } catch(e) {
      setPostStatus(PostStatus.Error);
      
      let finalErrorMessage = e instanceof Error ? e.message : 'An unknown error occurred while posting.';
      const permissionErrorKeywords = ["izin verilmiyor", "not allowed", "forbidden", "unauthorized"];

      if (permissionErrorKeywords.some(keyword => finalErrorMessage.toLowerCase().includes(keyword))) {
          finalErrorMessage = `WordPress Permission Error: ${finalErrorMessage}`;
      }
      
      setPostError(finalErrorMessage);
    }
  }, [generatedArticle, wordPressCreds, includeImage, setHaberCategory, publishStatus, scheduleDate]);
  
  const isPostable = wordPressCreds.siteUrl && wordPressCreds.username && wordPressCreds.password;
  
  const getPostButtonText = () => {
    switch (postStatus) {
      case PostStatus.UploadingImage: return 'Uploading Assets...';
      case PostStatus.Posting: return 'Publishing...';
      default: 
        if (publishStatus === WordPressPublicationStatus.Publish && scheduleDate && new Date(scheduleDate) > new Date()) {
          return 'Schedule Post';
        }
        return publishStatus === WordPressPublicationStatus.Publish ? 'Publish to WordPress' : 'Save Draft to WordPress';
    }
  }

  return (
    <div className="min-h-screen bg-[#0B101B] font-sans text-gray-100 relative overflow-hidden selection:bg-purple-500/30">
      {/* Deep Space Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto p-4 md:p-8 max-w-7xl">
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
                <div className="animate-fadeIn space-y-6">
                  <ArticlePreview 
                    article={generatedArticle}
                    onContentChange={handleArticleContentChange}
                    onRegenerateImages={handleRegenerateImages}
                    isRegeneratingImages={isRegeneratingImages}
                    isEditorEnabled={isEditorEnabled}
                  />
                  {isPostable && (
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-xl">
                       <button
                          onClick={handlePost}
                          disabled={postStatus === PostStatus.Posting || postStatus === PostStatus.UploadingImage}
                          className="w-full group relative flex justify-center py-4 px-6 border border-transparent rounded-xl text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          <span className="relative flex items-center gap-2">
                            {postStatus === PostStatus.Success ? (
                               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            )}
                            {getPostButtonText()}
                          </span>
                       </button>
                       {postStatus === PostStatus.Success && <p className="mt-4 text-center text-emerald-400 font-medium">{getSuccessMessage()}</p>}
                       {postStatus === PostStatus.Error && postError && <div className="mt-4"><ErrorDisplay message={postError} /></div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  function getSuccessMessage() {
    if (publishStatus === WordPressPublicationStatus.Publish && scheduleDate && new Date(scheduleDate) > new Date()) {
        return "Successfully scheduled post on WordPress!"
    }
    return `Successfully posted to WordPress!`
  }
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;