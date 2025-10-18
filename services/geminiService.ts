import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Tone, ArticleContent, Source } from '../types';

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
  const systemInstruction = `You are an AI news writer for Samanyolu.com, a Turkish digital media portal focused on technology, gaming, space/astronomy, books, and entertainment.  
Your writing style must be clear, engaging, and professional in Turkish, while also being optimized for SEO.  

Writing Guidelines:
- Always write in fluent, natural Turkish.  
- Start with a catchy introduction (2–3 sentences) that hooks the reader.  
- Use clear subheadings (H2, H3) to organize the article.  
- Keep sentences concise, but not robotic; aim for readability and flow.  
- Use bullet points, lists, or tables where helpful.  
- Provide context, comparisons, or practical value (not just news repetition).  
- End articles with a short conclusion.
- Integrate relevant keywords naturally for SEO (e.g., teknoloji haberleri, ücretsiz oyun kodları, akıllı telefon karşılaştırmaları).  
- Always write in an **informative yet slightly conversational** tone, not academic.  

Content Rules:
- Minimum length: 500–700 words for news, 800–1200 for guides/explainers.  
- Add Turkish date formats where relevant (örn: “20 Eylül 2025”).  
- For gaming articles, always include platforms (PC, PS, Xbox, Mobile).  
- For tech reviews, highlight fiyat, performans, avantajlar, dezavantlar.  
- For astronomy/science, explain concepts simply so anyone can understand.  
- NEVER fabricate fake news; if uncertain, write general facts + context.  

Output Format:
- Title (SEO friendly, 55–65 characters)  
- Meta Description (140–160 characters, keyword-rich)  
- Main Article (with subheadings, lists, conclusion)  

Example Titles:
- “2025’in En İyi Bütçe Telefonları: Öğrenciler İçin Rehber”  
- “Epic Games Bu Hafta Hangi Ücretsiz Oyunları Veriyor?”  
- “James Webb Teleskobu’ndan Yeni Görseller: Evrenin Sırları”  

Remember:  
You are not just summarizing news — you are creating **engaging, SEO-friendly, original Turkish articles** that fit Samanyolu.com’s voice.`;

  const prompt = `
    Please research the following topic using Google Search to ensure the information is up-to-date and accurate: "${topic}".

    Based on your research, generate a news article that adheres to these specific requirements:
    - The article must have a ${tone} tone.
    - ${includeTags ? 'Generate a list of 3-5 relevant tags for the article.' : 'The "tags" field in the JSON output must be an empty array [].'}
    - Ensure the main article content adheres to the length guidelines specified in the system instructions (500-700 words for news).
    - If you use lists, please format them with markdown (e.g., "1. First item" or "* Bullet item").

    The entire response MUST be a single, valid JSON object. Do not add any text, commentary, or markdown fences before or after the JSON.
    The JSON object must conform to the following structure:
    {
      "title": "string (The news article's headline.)",
      "content": "string[] (An array of strings, where each string is a paragraph or a list item of the article body.)",
      "metaDescription": "string (A short summary for SEO purposes.)",
      "tags": "string[] (An array of relevant keywords or tags for the article.)"
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const parsedData = parseJsonFromText<{
      title: string;
      content: string[];
      metaDescription: string;
      tags?: string[];
    }>(response.text);

    const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '',
      }))
      .filter(source => source.uri) || [];
      
    const contentArray = parsedData.content;
    let htmlContent = '';
    let inOl = false;
    let inUl = false;

    const closeLists = () => {
        if (inOl) {
            htmlContent += '</ol>\n';
            inOl = false;
        }
        if (inUl) {
            htmlContent += '</ul>\n';
            inUl = false;
        }
    };

    for (const line of contentArray) {
        const trimmedLine = line.trim();

        const olMatch = trimmedLine.match(/^(\d+[\.\)])\s*(.*)/);
        const ulMatch = trimmedLine.match(/^([*\-])\s*(.*)/);

        if (olMatch) {
            if (inUl) closeLists();
            if (!inOl) {
                htmlContent += '<ol>\n';
                inOl = true;
            }
            htmlContent += `  <li>${olMatch[2]}</li>\n`;
        } else if (ulMatch) {
            if (inOl) closeLists();
            if (!inUl) {
                htmlContent += '<ul>\n';
                inUl = true;
            }
            htmlContent += `  <li>${ulMatch[2]}</li>\n`;
        } else {
            closeLists();
            if (trimmedLine) {
                htmlContent += `<p>${trimmedLine}</p>\n`;
            }
        }
    }

    closeLists();

    const articleContent: ArticleContent = {
        title: parsedData.title,
        content: htmlContent.trim(),
        metaDescription: parsedData.metaDescription,
        tags: parsedData.tags,
        sources: sources
    };

    return articleContent;

  } catch (e) {
    console.error("Failed to generate article content:", e);
    if (e instanceof Error) {
      throw new Error(`AI content generation failed: ${e.message}`);
    }
    throw new Error("An unknown error occurred during AI content generation.");
  }
};

export const generateArticleImage = async (prompt: string, numberOfImages: number): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The AI did not return any images. This can happen if the topic is sensitive and triggers safety filters. Please try a different topic or adjust the image style.");
    }
    
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);

  } catch (e) {
    console.error("Failed to generate article image:", e);
    if (e instanceof Error) {
        if (e.message.includes('API_KEY_INVALID')) {
             throw new Error("Image generation failed: The API key is invalid. Please check your configuration.");
        }
        throw new Error(`AI image generation failed: ${e.message}`);
    }
    throw new Error("An unknown error occurred during AI image generation.");
  }
};


const fetchTopics = async (prompt: string): Promise<string[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              description: 'A list of 5 news topic strings.',
              items: { type: Type.STRING }
            }
          },
          required: ['topics'],
        }
      },
    });

    const data = parseJsonFromText<{ topics: string[] }>(response.text);
    return data.topics;
  } catch (e) {
    console.error("Failed to fetch topics:", e);
    throw new Error("Could not fetch trending topics from the AI service.");
  }
};

const baseTopicPrompt = "List 5 current and specific topics in";

export const fetchNationalTrendingTopics = () => fetchTopics(`${baseTopicPrompt} Turkish national news. For example: 'New economic policies announced in Turkey' or 'Major cultural event in Istanbul'. Provide only real, significant, and recent events relevant to Turkey.`);
export const fetchWorldNewsTopics = () => fetchTopics(`${baseTopicPrompt} world news. For example: 'Gaza humanitarian crisis update' or 'Venezuelan presidential election developments'. Provide only real, significant, and recent events.`);
export const fetchTechTrendingTopics = () => fetchTopics(`${baseTopicPrompt} technology. For example: 'Launch of the latest iPhone model' or 'Breakthroughs in AI image generation'. Provide only real, significant, and recent topics.`);
export const fetchEconomyTopics = () => fetchTopics(`${baseTopicPrompt} global or national economy. For example: 'US interest rate decisions by the Fed' or 'Impact of AI on the job market'. Provide only real, significant, and recent topics.`);
export const fetchHealthTopics = () => fetchTopics(`${baseTopicPrompt} health and medicine. For example: 'New advancements in cancer treatment' or 'Global response to the latest flu variant'. Provide only real, significant, and recent topics.`);
export const fetchScienceTopics = () => fetchTopics(`${baseTopicPrompt} science. For example: 'Latest discoveries from the James Webb Space Telescope' or 'Breakthroughs in quantum computing'. Provide only real, significant, and recent topics.`);
export const fetchEntertainmentTopics = () => fetchTopics(`${baseTopicPrompt} entertainment. For example: 'Box office results for the latest blockbuster movie' or 'Major announcements from the latest comic-con event'. Provide only real, significant, and recent topics.`);
export const fetchHoroscopeTopics = () => fetchTopics("List 5 horoscope-related article ideas. For example: 'How the upcoming mercury retrograde will affect Gemini' or 'Best career paths for a Leo'.");
export const fetchSportTrendingTopics = () => fetchTopics(`${baseTopicPrompt} sports. For example: 'Results of the Champions League final' or 'Major transfer news in the Premier League'. Provide only real, significant, and recent events.`);