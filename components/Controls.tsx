import React from 'react';
import { Tone, WordPressCredentials, WordPressPublicationStatus, ImageStyle } from '../types';

interface ControlsProps {
  topic: string;
  setTopic: (topic: string) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  includeImage: boolean;
  setIncludeImage: (include: boolean) => void;
  imageStyle: ImageStyle;
  setImageStyle: (style: ImageStyle) => void;
  numberOfImages: number;
  setNumberOfImages: (num: number) => void;
  imageCredit: string;
  setImageCredit: (credit: string) => void;
  includeTags: boolean;
  setIncludeTags: (include: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  trendingTopics: string[];
  onFetchNationalTopics: () => void;
  onFetchWorldNewsTopics: () => void;
  onFetchTechTopics: () => void;
  onFetchEconomyTopics: () => void;
  onFetchHealthTopics: () => void;
  onFetchScienceTopics: () => void;
  onFetchEntertainmentTopics: () => void;
  onFetchHoroscopeTopics: () => void;
  onFetchSportTopics: () => void;
  isFetchingTopics: boolean;
  wordPressCreds: WordPressCredentials;
  setWordPressCreds: (creds: WordPressCredentials) => void;
  setHaberCategory: boolean;
  setSetHaberCategory: (value: boolean) => void;
  publishStatus: WordPressPublicationStatus;
  setPublishStatus: (status: WordPressPublicationStatus) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  isEditorEnabled: boolean;
  setIsEditorEnabled: (enabled: boolean) => void;
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
  topic, setTopic, tone, setTone, includeImage, setIncludeImage, imageStyle, setImageStyle, numberOfImages, setNumberOfImages, imageCredit, setImageCredit, includeTags, setIncludeTags, onGenerate, isLoading,
  trendingTopics, onFetchNationalTopics, onFetchWorldNewsTopics, onFetchTechTopics, onFetchEconomyTopics, onFetchHealthTopics, onFetchScienceTopics, onFetchEntertainmentTopics, onFetchHoroscopeTopics, onFetchSportTopics, isFetchingTopics, wordPressCreds, setWordPressCreds,
  setHaberCategory, setSetHaberCategory, publishStatus, setPublishStatus, scheduleDate, setScheduleDate, isEditorEnabled, setIsEditorEnabled
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
  
  const inputStyles = "block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-colors duration-300";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const checkboxLabelStyles = "ml-2 block text-sm text-gray-900 dark:text-gray-200";
  const checkboxStyles = "h-4 w-4 rounded border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-offset-gray-800";
  const buttonBaseStyles = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors";
  const fetchingText = isFetchingTopics ? '...' : '';


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 transition-colors duration-300">
      {/* Topic Section */}
      <div className="space-y-4">
        <div>
          <label className={`${labelStyles} mb-2`}>
            Find News Topics
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={onFetchNationalTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-400/80 dark:disabled:bg-teal-500/50`}>{fetchingText || 'National'}</button>
            <button onClick={onFetchWorldNewsTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 disabled:bg-sky-400/80 dark:disabled:bg-sky-500/50`}>{fetchingText || 'World News'}</button>
            <button onClick={onFetchTechTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-400/80 dark:disabled:bg-slate-500/50`}>{fetchingText || 'Tech'}</button>
            <button onClick={onFetchEconomyTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400/80 dark:disabled:bg-emerald-500/50`}>{fetchingText || 'Economy'}</button>
            <button onClick={onFetchHealthTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-400/80 dark:disabled:bg-rose-500/50`}>{fetchingText || 'Health'}</button>
            <button onClick={onFetchScienceTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400/80 dark:disabled:bg-amber-500/50`}>{fetchingText || 'Science'}</button>
            <button onClick={onFetchEntertainmentTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 disabled:bg-pink-400/80 dark:disabled:bg-pink-500/50`}>{fetchingText || 'Entertainment'}</button>
            <button onClick={onFetchHoroscopeTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-400/80 dark:disabled:bg-purple-500/50`}>{fetchingText || 'Horoscope'}</button>
            <button onClick={onFetchSportTopics} disabled={isFetchingTopics} className={`${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400/80 dark:disabled:bg-blue-500/50`}>{fetchingText || 'Sport'}</button>
          </div>
        </div>
        {trendingTopics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Click a topic to use it:</p>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t, i) => (
                <button key={i} onClick={() => setTopic(t)} className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-indigo-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-indigo-500 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="topic" className={labelStyles}>
            News Topic
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="...or enter your own topic"
            rows={3}
            className={`mt-1 ${inputStyles}`}
          />
        </div>
      </div>

      {/* Generation Options */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
         <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Generation Options</h3>
        <div>
          <label htmlFor="tone" className={labelStyles}>Article Tone</label>
          <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className={`mt-1 ${inputStyles}`}>
            {Object.values(Tone).map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div className="flex items-center">
          <input id="include-image" type="checkbox" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)} className={checkboxStyles} />
          <label htmlFor="include-image" className={checkboxLabelStyles}>Include AI-generated image</label>
        </div>
        {includeImage && (
          <div className="pl-6 space-y-4">
            <div>
                <label htmlFor="imageStyle" className={labelStyles}>Image Style</label>
                <select id="imageStyle" value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} className={`mt-1 ${inputStyles}`}>
                    {Object.values(ImageStyle).map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
            </div>
            <div>
              <label htmlFor="numberOfImages" className={labelStyles}>Number of Images</label>
              <select 
                id="numberOfImages" 
                value={numberOfImages} 
                onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))} 
                className={`mt-1 ${inputStyles}`}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div>
                <label htmlFor="imageCredit" className={labelStyles}>Image Credit / Watermark</label>
                <input 
                  type="text"
                  id="imageCredit"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder="e.g., Your News Site"
                  className={`mt-1 ${inputStyles}`}
                />
            </div>
          </div>
        )}
        <div className="flex items-center">
          <input id="include-tags" type="checkbox" checked={includeTags} onChange={(e) => setIncludeTags(e.target.checked)} className={checkboxStyles} />
          <label htmlFor="include-tags" className={checkboxLabelStyles}>Include AI-generated tags</label>
        </div>
        <div className="flex items-center">
          <input id="enable-editor" type="checkbox" checked={isEditorEnabled} onChange={(e) => setIsEditorEnabled(e.target.checked)} className={checkboxStyles} />
          <label htmlFor="enable-editor" className={checkboxLabelStyles}>Enable rich text editor</label>
        </div>
        <button onClick={onGenerate} disabled={isLoading || !topic.trim()} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors">
          {isLoading ? 'Generating...' : 'Generate News'}
        </button>
      </div>

      {/* WordPress Credentials */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">WordPress Publisher</h3>
        
        <div>
            <label htmlFor="preconfiguredSite" className={labelStyles}>Quick Select Site</label>
            <select 
              id="preconfiguredSite"
              value={currentSiteName}
              onChange={handleSiteSelect} 
              className={`mt-1 ${inputStyles}`}
            >
              <option value="">-- Manual Entry --</option>
              {preconfiguredSites.map(site => (
                <option key={site.name} value={site.name}>{site.name}</option>
              ))}
            </select>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 !mt-2">Requires an <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Application Password</a>.</p>
        
        <div>
          <label htmlFor="siteUrl" className={labelStyles}>WordPress Site URL</label>
          <input type="text" name="siteUrl" id="siteUrl" value={wordPressCreds.siteUrl} onChange={handleCredsChange} placeholder="https://example.com" className={`mt-1 ${inputStyles}`} />
        </div>
        <div>
          <label htmlFor="username" className={labelStyles}>WordPress Username</label>
          <input type="text" name="username" id="username" value={wordPressCreds.username} onChange={handleCredsChange} placeholder="your-wp-username" className={`mt-1 ${inputStyles}`} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">User must have 'Editor' or 'Administrator' role to publish directly.</p>
        </div>
        <div>
          <label htmlFor="password"  className={labelStyles}>Application Password</label>
          <input type="password" name="password" id="password" value={wordPressCreds.password} onChange={handleCredsChange} placeholder="xxxx xxxx xxxx xxxx" className={`mt-1 ${inputStyles}`} />
        </div>

        <div>
            <label htmlFor="publishStatus" className={labelStyles}>Publication Status</label>
            <select 
                id="publishStatus" 
                value={publishStatus} 
                onChange={(e) => setPublishStatus(e.target.value as WordPressPublicationStatus)} 
                className={`mt-1 ${inputStyles}`}
            >
                <option value={WordPressPublicationStatus.Draft}>Save as Draft</option>
                <option value={WordPressPublicationStatus.Publish}>Publish Immediately</option>
            </select>
        </div>
        
        {publishStatus === WordPressPublicationStatus.Publish && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600 transition-all duration-300">
                <label htmlFor="scheduleDate" className={labelStyles}>Publish Date/Time (Optional)</label>
                <input
                    type="datetime-local"
                    id="scheduleDate"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className={`mt-1 ${inputStyles}`}
                    min={new Date().toISOString().slice(0, 16)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave blank to publish now. Set a future date to schedule the post.</p>
            </div>
        )}

        <div className="flex items-center pt-2">
            <input 
              id="set-haber-category" 
              type="checkbox" 
              checked={setHaberCategory} 
              onChange={(e) => setSetHaberCategory(e.target.checked)} 
              className={checkboxStyles}
            />
            <label htmlFor="set-haber-category" className={checkboxLabelStyles}>Set category as "Haber"</label>
        </div>
      </div>
    </div>
  );
};

export default Controls;