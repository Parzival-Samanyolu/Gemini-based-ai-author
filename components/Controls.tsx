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
  
  // Styles
  const panelStyles = "bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6";
  const inputStyles = "block w-full rounded-lg border border-gray-700 bg-gray-800/50 text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 py-2.5 placeholder-gray-500";
  const labelStyles = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5";
  const sectionHeaderStyles = "text-sm font-bold text-white uppercase tracking-wider flex items-center pb-2 border-b border-white/5";
  const checkboxLabelStyles = "ml-2.5 block text-sm text-gray-300 select-none";
  const checkboxStyles = "h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-gray-900 focus:ring-blue-500 cursor-pointer";
  
  // Topic Button Styles - Modern Pills
  const topicBtnBase = "w-full py-2 px-1 rounded-lg text-[10px] sm:text-xs font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:text-white border border-white/5 hover:border-white/10 transition-all duration-200";
  
  return (
    <div className={panelStyles}>
      {/* Topic Section */}
      <div className="space-y-5">
        <div>
          <h3 className={sectionHeaderStyles}>
             <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             Intelligence Sources
          </h3>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button onClick={onFetchNationalTopics} disabled={isFetchingTopics} className={topicBtnBase}>Turkey</button>
            <button onClick={onFetchWorldNewsTopics} disabled={isFetchingTopics} className={topicBtnBase}>World</button>
            <button onClick={onFetchTechTopics} disabled={isFetchingTopics} className={topicBtnBase}>Tech</button>
            <button onClick={onFetchEconomyTopics} disabled={isFetchingTopics} className={topicBtnBase}>Economy</button>
            <button onClick={onFetchHealthTopics} disabled={isFetchingTopics} className={topicBtnBase}>Health</button>
            <button onClick={onFetchScienceTopics} disabled={isFetchingTopics} className={topicBtnBase}>Science</button>
            <button onClick={onFetchEntertainmentTopics} disabled={isFetchingTopics} className={topicBtnBase}>Pop Culture</button>
            <button onClick={onFetchHoroscopeTopics} disabled={isFetchingTopics} className={topicBtnBase}>Astro</button>
            <button onClick={onFetchSportTopics} disabled={isFetchingTopics} className={topicBtnBase}>Sport</button>
          </div>
        </div>

        {trendingTopics.length > 0 && (
          <div className="bg-blue-900/10 p-3 rounded-xl border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center">
               Trending Now
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t, i) => (
                <button 
                    key={i} 
                    onClick={() => setTopic(t)} 
                    className="px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-blue-500 hover:text-blue-400 transition-colors text-left truncate max-w-full"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="topic" className={labelStyles}>
            Topic / Prompt
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
            <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe the story you want Gemini to write..."
                rows={3}
                className={`${inputStyles} relative bg-gray-900 resize-none focus:ring-0 border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="pt-2 space-y-5">
         <h3 className={sectionHeaderStyles}>
            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Configuration
         </h3>
        
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label htmlFor="tone" className={labelStyles}>Tone & Voice</label>
                <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className={inputStyles}>
                    {Object.values(Tone).map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
            </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-4 space-y-4 border border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="include-image" type="checkbox" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)} className={checkboxStyles} />
                    <label htmlFor="include-image" className={checkboxLabelStyles}>Generate Image (Imagen 4)</label>
                </div>
            </div>
            
            {includeImage && (
            <div className="pl-6 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="imageStyle" className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Style</label>
                        <select id="imageStyle" value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} className={`${inputStyles} py-1.5 text-xs`}>
                            {Object.values(ImageStyle).map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="numberOfImages" className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Count</label>
                        <select id="numberOfImages" value={numberOfImages} onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))} className={`${inputStyles} py-1.5 text-xs`}>
                            {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="imageCredit" className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Watermark Text</label>
                    <input 
                    type="text"
                    id="imageCredit"
                    value={imageCredit}
                    onChange={(e) => setImageCredit(e.target.value)}
                    placeholder="e.g. Samanyolu Haber"
                    className={`${inputStyles} py-1.5 text-xs`}
                    />
                </div>
            </div>
            )}
        </div>

        <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
                <input id="include-tags" type="checkbox" checked={includeTags} onChange={(e) => setIncludeTags(e.target.checked)} className={checkboxStyles} />
                <label htmlFor="include-tags" className={checkboxLabelStyles}>SEO Tags</label>
            </div>
            <div className="flex items-center">
                <input id="enable-editor" type="checkbox" checked={isEditorEnabled} onChange={(e) => setIsEditorEnabled(e.target.checked)} className={checkboxStyles} />
                <label htmlFor="enable-editor" className={checkboxLabelStyles}>Rich Editor</label>
            </div>
        </div>

        <button 
            onClick={onGenerate} 
            disabled={isLoading || !topic.trim()} 
            className="w-full relative group overflow-hidden py-4 px-4 rounded-xl shadow-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-shimmer bg-[length:200%_100%]"></div>
            <div className="relative flex items-center justify-center">
               {isLoading ? (
                   <>Processing Request...</>
               ) : (
                   <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Initialize Construction
                   </>
               )}
            </div>
        </button>
      </div>

      {/* WordPress Credentials */}
      <div className="pt-4 space-y-5">
        <h3 className={sectionHeaderStyles}>
             <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.013 0C5.392 0 0 5.38 0 12.013c0 6.62 5.38 12.013 12.013 12.013 6.62 0 12.013-5.38 12.013-12.013C24.026 5.392 18.645 0 12.013 0zm0 23.24c-1.343 0-2.622-.23-3.82-.648 2.066-3.615 3.19-6.577 3.884-9.972.087-.403.15-.807.2-1.225.766 3.347 2.183 6.772 4.294 9.492-1.377.948-3.033 1.512-4.82 1.512v.84zm0-22.436c1.455 0 2.84.33 4.088.91L12.59 12.05c-.4-2.93-1.313-5.84-2.563-8.546 1.03-.298 2.13-.46 3.27-.46h-.712zm-9.99 18.914c-1.06-1.722-1.68-3.75-1.68-5.933 0-4.152 2.13-7.833 5.373-9.934l-4.46 12.237.767 3.63zM20.924 4.52c1.592 2.08 2.54 4.7 2.54 7.547 0 2.553-.79 4.92-2.13 6.885l.088.432-4.735-13.73c1.382-.734 2.884-1.134 4.237-1.134z"/></svg>
             Deployment Target
        </h3>
        
        <div>
            <label htmlFor="preconfiguredSite" className={labelStyles}>Quick Select</label>
            <select 
              id="preconfiguredSite"
              value={currentSiteName}
              onChange={handleSiteSelect} 
              className={inputStyles}
            >
              <option value="">-- Custom Site --</option>
              {preconfiguredSites.map(site => (
                <option key={site.name} value={site.name}>{site.name}</option>
              ))}
            </select>
        </div>
        
        <div className="space-y-3">
            <div>
                <input type="text" name="siteUrl" id="siteUrl" value={wordPressCreds.siteUrl} onChange={handleCredsChange} placeholder="Site URL (https://...)" className={inputStyles} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input type="text" name="username" id="username" value={wordPressCreds.username} onChange={handleCredsChange} placeholder="Username" className={inputStyles} />
                <input type="password" name="password" id="password" value={wordPressCreds.password} onChange={handleCredsChange} placeholder="App Password" className={inputStyles} />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div>
                <label htmlFor="publishStatus" className={labelStyles}>Status</label>
                <select 
                    id="publishStatus" 
                    value={publishStatus} 
                    onChange={(e) => setPublishStatus(e.target.value as WordPressPublicationStatus)} 
                    className={inputStyles}
                >
                    <option value={WordPressPublicationStatus.Draft}>Draft</option>
                    <option value={WordPressPublicationStatus.Publish}>Publish</option>
                </select>
            </div>
            
            {publishStatus === WordPressPublicationStatus.Publish && (
                <div className="animate-fadeIn">
                    <label htmlFor="scheduleDate" className={labelStyles}>Schedule (Optional)</label>
                    <input
                        type="datetime-local"
                        id="scheduleDate"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className={inputStyles}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                </div>
            )}
        </div>

        <div className="flex items-center pt-2">
            <input 
              id="set-haber-category" 
              type="checkbox" 
              checked={setHaberCategory} 
              onChange={(e) => setSetHaberCategory(e.target.checked)} 
              className={checkboxStyles}
            />
            <label htmlFor="set-haber-category" className={checkboxLabelStyles}>Add "Haber" Category</label>
        </div>
      </div>
    </div>
  );
};

export default Controls;