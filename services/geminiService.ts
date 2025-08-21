
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Tone, ArticleContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromText = <T,>(text: string): T => {
  let jsonStr = text.trim();

  // Handle markdown fences first
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  
  // If no fences, or after stripping them, there might still be text before the JSON
  const firstBracket = jsonStr.indexOf('[');
  const firstBrace = jsonStr.indexOf('{');
  
  // Find the start of the actual JSON data
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      jsonStr = jsonStr.substring(firstBracket);
  } else if (firstBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace);
  }
  
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response. Original text:", text, "Processed string:", jsonStr, "Error:", e);
    throw new Error("The AI returned an invalid data format. Please try again.");
  }
};


export const generateArticleContent = async (topic: string, tone: Tone, includeTags: boolean): Promise<ArticleContent> => {
  const prompt = `
    Act as a seasoned journalist for a major Turkish news publication. Your task is to write a high-quality, engaging, and human-like news article on the topic: "${topic}".
    
    The entire article must be written in Turkish, with a ${tone} tone.
    The total length of the article's content (the 'content' field) must be between 3000 and 5000 characters.

    To make the article feel authentic and human-written, please adhere to these guidelines:
    - **Structure:** The article must have a clear structure: an engaging introduction (lede), a detailed body, and a summary conclusion.
    - **Engaging Content:**
        - Start with a strong opening paragraph that grabs the reader's attention.
        - Include at least one or two *fictional but plausible quotes* from relevant figures (e.g., experts, officials, witnesses) to add depth and authenticity. Attribute them realistically (e.g., "Ekonomi analisti Dr. Aylin Yılmaz, konuyla ilgili olarak, '...' dedi.").
        - Use varied sentence structures and lengths to create a natural reading flow.
        - The body of the article should provide background, details, and context.
    - **Conclusion:** End with a concluding paragraph that summarizes the key points and offers a forward-looking perspective on the topic.

    The output must be a single, minified JSON object with no markdown formatting.
    The JSON object must follow this exact structure:
    {
      "title": "string",
      "content": ["string", "string", ...],
      "metaDescription": "string"${includeTags ? ',\n      "tags": ["string", "string", "string"]' : ''}
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const articleData = parseJsonFromText<ArticleContent>(response.text);

    if (!articleData.title || !Array.isArray(articleData.content) || articleData.content.length === 0 || !articleData.metaDescription || (includeTags && !Array.isArray(articleData.tags))) {
        throw new Error("Invalid article structure received from AI. Required fields are missing.");
    }
    
    return articleData;

  } catch (error) {
    console.error("Error generating article content:", error);
    throw new Error("Failed to generate article content. The AI service may be unavailable or the topic may be restricted.");
  }
};


export const generateArticleImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    // Don't throw, just return null so the article can still be displayed.
    return null;
  }
};

const fetchTopics = async (prompt: string, errorContext: string): Promise<string[]> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: prompt.includes("horoscope") ? [] : [{ googleSearch: {} }],
                temperature: 0.5,
            },
        });
        
        const topics = parseJsonFromText<string[]>(response.text);
        if (!Array.isArray(topics)) {
             throw new Error("Parsed data is not an array.");
        }
        return topics.map(t => String(t));

    } catch (error) {
        console.error(`Error fetching ${errorContext}:`, error);
        throw new Error(`Failed to fetch ${errorContext}. The AI returned an invalid format.`);
    }
};

export const fetchNationalTrendingTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and current news topics from Turkey or relevant to a Turkish audience.
        The topics must be in Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Türkiye'deki güncel ekonomi gelişmeleri", "Yeni yerli teknoloji ürünleri tanıtıldı", "Süper Lig'de son durum"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
    return fetchTopics(prompt, "national trending topics");
};

export const fetchWorldwideTrendingTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and current worldwide news topics.
        The topics must be translated into Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Uluslararası iklim değişikliği zirvesi sonuçları", "Asya borsalarında büyük hareketlilik", "Avrupa'da yeni teknoloji düzenlemeleri"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
    return fetchTopics(prompt, "worldwide trending topics");
};

export const fetchTechTrendingTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and current technology news topics. Include topics like new gadgets, software updates, AI advancements, and tech industry news.
        The topics must be in Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Yeni yapay zeka modeli tanıtıldı", "Son model akıllı telefonların özellikleri", "Türkiye'deki siber güvenlik tehditleri"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
    return fetchTopics(prompt, "tech trending topics");
};

export const fetchFamousSingerTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and interesting news topics about the lives of famous singers (can be from Turkey or worldwide). Include topics about their careers, personal lives, or recent events.
        The topics must be in Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Tarkan'ın yeni albümünün perde arkası", "Sezen Aksu'nun bilinmeyen bir anısı", "Genç bir pop yıldızının yükselişi", "Bir rock efsanesinin müziğe vedası"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
    return fetchTopics(prompt, "famous singer topics");
};

export const fetchHoroscopeTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and interesting topics related to horoscopes, astrology, or daily zodiac predictions.
        The topics must be in Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Haftalık burç yorumları: Aşk ve kariyer", "Bugünün astroloji haritası ve etkileri", "Yükselen burcunuza göre kişilik analizleri", "Dolunayın Koç burcuna etkileri"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
     try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
            },
        });
        
        const topics = parseJsonFromText<string[]>(response.text);
        if (!Array.isArray(topics)) {
             throw new Error("Parsed data is not an array.");
        }
        return topics.map(t => String(t));

    } catch (error) {
        console.error("Error fetching horoscope topics:", error);
        throw new Error("Failed to fetch horoscope topics. The AI returned an invalid format.");
    }
};

export const fetchSportTrendingTopics = async (): Promise<string[]> => {
    const prompt = `
        List 5 diverse and current sports news topics, focusing on popular sports in Turkey like football and basketball.
        The topics must be in Turkish.
        Return ONLY a valid JSON array of strings.
        Example: ["Süper Lig'de şampiyonluk yarışı kızıştı", "Basketbol milli takımı Avrupa'da", "Voleybolda Filenin Sultanları'nın son maçı"].
        Do not add any commentary, introduction, or markdown fences. Your entire response must be the JSON array itself.
    `;
    return fetchTopics(prompt, "sport trending topics");
};
