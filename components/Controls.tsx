import React from 'react';
import { Tone, WordPressCredentials, WordPressPublicationStatus } from '../types';

interface ControlsProps {
  topic: string;
  setTopic: (topic: string) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  includeImage: boolean;
  setIncludeImage: (include: boolean) => void;
  imageCredit: string;
  setImageCredit: (credit: string) => void;
  includeTags: boolean;
  setIncludeTags: (include: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  trendingTopics: string[];
  onFetchNationalTopics: () => void;
  onFetchWorldwideTopics: () => void;
  onFetchTechTopics: () => void;
  onFetchSingerTopics: () => void;
  onFetchHoroscopeTopics: () => void;
  onFetchSportTopics: () => void;
  isFetchingTopics: boolean;
  wordPressCreds: WordPressCredentials;
  setWordPressCreds: (creds: WordPressCredentials) => void;
  setHaberCategory: boolean;
  setSetHaberCategory: (value: boolean) => void;
  publishStatus: WordPressPublicationStatus;
  setPublishStatus: (status: WordPressPublicationStatus) => void;
}

interface PreconfiguredSite {
  name: string;
  creds: WordPressCredentials;
}

const preconfiguredSites: PreconfiguredSite[] = [
  {
    name: 'Gonca',
    creds: {
      siteUrl: 'https://gonca.com',
      username: 'Parzival',
      password: 'y5bj PALV jD2C LAcq KsSJ Jahp'
    }
  },
  {
    name: 'Samanyolu',
    creds: {
      siteUrl: 'https://samanyolu.com',
      username: 'admin',
      password: 'kPPg BZNH 5aNS eeV7 QWPK ZYaa'
    }
  }
];

const Controls: React.FC<ControlsProps> = ({
  topic, setTopic, tone, setTone, includeImage, setIncludeImage, imageCredit, setImageCredit, includeTags, setIncludeTags, onGenerate, isLoading,
  trendingTopics, onFetchNationalTopics, onFetchWorldwideTopics, onFetchTechTopics, onFetchSingerTopics, onFetchHoroscopeTopics, onFetchSportTopics, isFetchingTopics, wordPressCreds, setWordPressCreds,
  setHaberCategory, setSetHaberCategory, publishStatus, setPublishStatus
}) => {
  
  const handleCredsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordPressCreds({
      ...wordPressCreds,
      [e.target.name]: e.target.value,
    });
  };

  const handleSiteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const siteName = e.target.value;
    const selectedSite = preconfiguredSites.find(site => site.name === siteName);
    if (selectedSite) {
      setWordPressCreds(selectedSite.creds);
    } else {
      setWordPressCreds({ siteUrl: '', username: '', password: '' });
    }
  };

  const currentSiteName = preconfiguredSites.find(site => 
      site.creds.siteUrl === wordPressCreds.siteUrl &&
      site.creds.username === wordPressCreds.username &&
      site.creds.password === wordPressCreds.password
  )?.name || '';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      {/* Topic Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Find News Topics
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onFetchNationalTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'National'}
            </button>
            <button
              onClick={onFetchWorldwideTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'Worldwide'}
            </button>
            <button
              onClick={onFetchTechTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'Tech'}
            </button>
            <button
              onClick={onFetchSingerTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-pink-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'Singers'}
            </button>
            <button
              onClick={onFetchHoroscopeTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'Horoscope'}
            </button>
             <button
              onClick={onFetchSportTopics}
              disabled={isFetchingTopics}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            >
              {isFetchingTopics ? '...' : 'Sport'}
            </button>
          </div>
        </div>
        {trendingTopics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Click a topic to use it:</p>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t, i) => (
                <button key={i} onClick={() => setTopic(t)} className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-indigo-200 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            News Topic
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="...or enter your own topic"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Generation Options */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
         <h3 className="text-lg font-medium text-gray-900">Generation Options</h3>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Article Tone</label>
          <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            {Object.values(Tone).map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div className="flex items-center">
          <input id="include-image" type="checkbox" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="include-image" className="ml-2 block text-sm text-gray-900">Include AI-generated image</label>
        </div>
        {includeImage && (
          <div className="pl-6 space-y-1">
            <label htmlFor="imageCredit" className="block text-sm font-medium text-gray-700">Image Credit / Watermark</label>
            <input 
              type="text"
              id="imageCredit"
              value={imageCredit}
              onChange={(e) => setImageCredit(e.target.value)}
              placeholder="e.g., Your News Site"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        )}
        <div className="flex items-center">
          <input id="include-tags" type="checkbox" checked={includeTags} onChange={(e) => setIncludeTags(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="include-tags" className="ml-2 block text-sm text-gray-900">Include AI-generated tags</label>
        </div>
        <button onClick={onGenerate} disabled={isLoading || !topic.trim()} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
          {isLoading ? 'Generating...' : 'Generate News'}
        </button>
      </div>

      {/* WordPress Credentials */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">WordPress Publisher</h3>
        
        <div>
            <label htmlFor="preconfiguredSite" className="block text-sm font-medium text-gray-700">Quick Select Site</label>
            <select 
              id="preconfiguredSite"
              value={currentSiteName}
              onChange={handleSiteSelect} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">-- Manual Entry --</option>
              {preconfiguredSites.map(site => (
                <option key={site.name} value={site.name}>{site.name}</option>
              ))}
            </select>
        </div>

        <p className="text-xs text-gray-500 !mt-2">Requires an <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Application Password</a>.</p>
        
        <div>
          <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700">WordPress Site URL</label>
          <input type="text" name="siteUrl" id="siteUrl" value={wordPressCreds.siteUrl} onChange={handleCredsChange} placeholder="https://example.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">WordPress Username</label>
          <input type="text" name="username" id="username" value={wordPressCreds.username} onChange={handleCredsChange} placeholder="your-wp-username" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          <p className="mt-1 text-xs text-gray-500">User must have 'Editor' or 'Administrator' role to publish directly.</p>
        </div>
        <div>
          <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Application Password</label>
          <input type="password" name="password" id="password" value={wordPressCreds.password} onChange={handleCredsChange} placeholder="xxxx xxxx xxxx xxxx" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
            <label htmlFor="publishStatus" className="block text-sm font-medium text-gray-700">Publication Status</label>
            <select 
                id="publishStatus" 
                value={publishStatus} 
                onChange={(e) => setPublishStatus(e.target.value as WordPressPublicationStatus)} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                <option value={WordPressPublicationStatus.Draft}>Save as Draft</option>
                <option value={WordPressPublicationStatus.Publish}>Publish Immediately</option>
            </select>
        </div>

        <div className="flex items-center pt-2">
            <input 
              id="set-haber-category" 
              type="checkbox" 
              checked={setHaberCategory} 
              onChange={(e) => setSetHaberCategory(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
            />
            <label htmlFor="set-haber-category" className="ml-2 block text-sm text-gray-900">Set category as "Haber"</label>
        </div>
      </div>
    </div>
  );
};

export default Controls;