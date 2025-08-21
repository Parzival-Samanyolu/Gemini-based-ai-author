
import React, { useState, useCallback } from 'react';
import { Tone, Article, WordPressCredentials, PostStatus, WordPressPublicationStatus } from './types';
import { generateArticleContent, generateArticleImage, fetchNationalTrendingTopics, fetchWorldwideTrendingTopics, fetchTechTrendingTopics, fetchFamousSingerTopics, fetchHoroscopeTopics, fetchSportTrendingTopics } from './services/geminiService';
import { postToWordPress, uploadImageToWordPress } from './services/wordpressService';
import { addTitleToImage } from './services/imageService';
import Header from './components/Header';
import Controls from './components/Controls';
import ArticlePreview from './components/ArticlePreview';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<Tone>(Tone.Journalistic);
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [imageCredit, setImageCredit] = useState<string>('');
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [setHaberCategory, setSetHaberCategory] = useState<boolean>(true);
  const [publishStatus, setPublishStatus] = useState<WordPressPublicationStatus>(WordPressPublicationStatus.Publish);
  const [wordPressCreds, setWordPressCreds] = useState<WordPressCredentials>({ siteUrl: '', username: '', password: '' });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isFetchingTopics, setIsFetchingTopics] = useState<boolean>(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  
  const [postStatus, setPostStatus] = useState<PostStatus>(PostStatus.Idle);
  const [postError, setPostError] = useState<string | null>(null);

  const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState<boolean>(false);

  const handleFetchNationalTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchNationalTrendingTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchWorldwideTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchWorldwideTrendingTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchTechTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchTechTrendingTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchSingerTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchFamousSingerTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchHoroscopeTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchHoroscopeTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

  const handleFetchSportTopics = useCallback(async () => {
    setIsFetchingTopics(true);
    setError(null);
    setTrendingTopics([]);
    try {
      const topics = await fetchSportTrendingTopics();
      setTrendingTopics(topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching topics.');
    } finally {
      setIsFetchingTopics(false);
    }
  }, []);

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
    setIsRegeneratingImage(false);

    try {
      const articleContent = await generateArticleContent(topic, tone, includeTags);
      let imageUrl: string | null = null;
      
      if (includeImage) {
        const imagePrompt = `A photorealistic, high-quality, journalistic-style photo capturing the essence of the news headline: "${articleContent.title}". The image should look like it was taken by a professional photojournalist on location. Avoid any text or watermarks.`;
        const rawImageUrl = await generateArticleImage(imagePrompt);

        if (rawImageUrl) {
          imageUrl = await addTitleToImage(rawImageUrl, articleContent.title, imageCredit);
        }
      }

      const fullArticle: Article = { ...articleContent, imageUrl };
      setGeneratedArticle(fullArticle);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, tone, includeImage, includeTags, imageCredit]);

  const handleRegenerateImage = useCallback(async () => {
    if (!generatedArticle) return;

    setIsRegeneratingImage(true);
    setError(null);

    try {
      const imagePrompt = `A photorealistic, high-quality, journalistic-style photo capturing the essence of the news headline: "${generatedArticle.title}". The image should look like it was taken by a professional photojournalist on location. Avoid any text or watermarks.`;
      const newRawImageUrl = await generateArticleImage(imagePrompt);

      if (newRawImageUrl) {
        const newImageUrlWithTitle = await addTitleToImage(newRawImageUrl, generatedArticle.title, imageCredit);
        setGeneratedArticle(prev => prev ? { ...prev, imageUrl: newImageUrlWithTitle } : null);
      } else {
        setError('Could not regenerate image. The AI service might be unavailable.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during image regeneration.');
    } finally {
      setIsRegeneratingImage(false);
    }
  }, [generatedArticle, imageCredit]);

  const handlePost = useCallback(async () => {
    if (!generatedArticle) return;

    setPostStatus(PostStatus.Idle);
    setPostError(null);
    let mediaId: number | null = null;
    
    try {
      // Step 1: Upload image to WP Media Library if it exists
      if (includeImage && generatedArticle.imageUrl) {
        setPostStatus(PostStatus.UploadingImage);
        const filename = generatedArticle.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) + '.jpg';
        mediaId = await uploadImageToWordPress(wordPressCreds, generatedArticle.imageUrl, filename);
      }
      
      // Step 2: Post the article content with the featured media ID
      setPostStatus(PostStatus.Posting);
      await postToWordPress(wordPressCreds, generatedArticle, mediaId, setHaberCategory, publishStatus);

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
          finalErrorMessage = `WordPress Permission Error: The specified user cannot create or edit posts. Please check that the user has the 'Author', 'Editor', or 'Administrator' role assigned in your WordPress dashboard. Also, verify that no security plugins are blocking REST API requests. (Original error: ${finalErrorMessage})`;
      }
      
      setPostError(finalErrorMessage);
    }
  }, [generatedArticle, wordPressCreds, includeImage, setHaberCategory, publishStatus]);
  
  const isPostable = wordPressCreds.siteUrl && wordPressCreds.username && wordPressCreds.password;
  
  const getPostButtonText = () => {
    switch (postStatus) {
      case PostStatus.UploadingImage: return 'Uploading Image...';
      case PostStatus.Posting: return 'Posting Article...';
      default: return publishStatus === WordPressPublicationStatus.Publish ? 'Publish to WordPress' : 'Post to WordPress as Draft';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
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
              imageCredit={imageCredit}
              setImageCredit={setImageCredit}
              includeTags={includeTags}
              setIncludeTags={setIncludeTags}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              trendingTopics={trendingTopics}
              onFetchNationalTopics={handleFetchNationalTopics}
              onFetchWorldwideTopics={handleFetchWorldwideTopics}
              onFetchTechTopics={handleFetchTechTopics}
              onFetchSingerTopics={handleFetchSingerTopics}
              onFetchHoroscopeTopics={handleFetchHoroscopeTopics}
              onFetchSportTopics={handleFetchSportTopics}
              isFetchingTopics={isFetchingTopics}
              wordPressCreds={wordPressCreds}
              setWordPressCreds={setWordPressCreds}
              setHaberCategory={setHaberCategory}
              setSetHaberCategory={setSetHaberCategory}
              publishStatus={publishStatus}
              setPublishStatus={setPublishStatus}
            />
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded-xl shadow-lg min-h-[500px] flex flex-col">
              {isLoading && <div className="flex-grow flex items-center justify-center"><Loader /></div>}
              {error && !isLoading && <ErrorDisplay message={error} />}
              {!isLoading && !error && !generatedArticle && (
                <div className="text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your article preview will appear here</h3>
                  <p className="mt-1 text-sm text-gray-500">Fetch topics or enter one, then click "Generate News".</p>
                </div>
              )}
              {generatedArticle && (
                <div className="space-y-6">
                  <ArticlePreview 
                    article={generatedArticle} 
                    onRegenerateImage={handleRegenerateImage}
                    isRegeneratingImage={isRegeneratingImage}
                  />
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                     <h3 className="font-semibold text-gray-800">Publish to WordPress</h3>
                     {!isPostable && <p className="text-sm text-orange-600">Please provide all WordPress credentials in the left panel to enable posting.</p>}
                     <button
                        onClick={handlePost}
                        disabled={!isPostable || postStatus === PostStatus.Posting || postStatus === PostStatus.UploadingImage}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                     >
                       {getPostButtonText()}
                     </button>
                     {postStatus === PostStatus.Success && <p className="text-sm text-green-600 text-center">Successfully posted to WordPress! Check your 'Posts' section for the new {publishStatus === WordPressPublicationStatus.Publish ? 'post' : 'draft'}.</p>}
                     {postStatus === PostStatus.Error && postError && <ErrorDisplay message={postError} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
