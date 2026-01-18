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
  
  const firstBracket = jsonStr.indexOf('[');
  const firstBrace = jsonStr.indexOf('{');
  
  let start = -1;
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      start = firstBracket;
  } else if (firstBrace !== -1) {
      start = firstBrace;
  }

  if (start === -1) {
      console.error("Could not find start of JSON ('{' or '[') in response. Original text:", text);
      throw new Error("The model returned an invalid data format. Please try again.");
  }

  const lastBracket = jsonStr.lastIndexOf(']');
  const lastBrace = jsonStr.lastIndexOf('}');
  
  const end = Math.max(lastBracket, lastBrace);

  if (end === -1) {
      console.error("Could not find end of JSON ('}' or ']') in response. Original text:", text);
      throw new Error("The model returned an invalid data format. Please try again.");
  }
  
  // Take the substring from the first opening brace/bracket to the last closing brace/bracket
  jsonStr = jsonStr.substring(start, end + 1);
  
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response. Original text:", text, "Processed string:", jsonStr, "Error:", e);
    throw new Error("The model returned an invalid data format. Please try again.");
  }
};


export const generateArticleContent = async (topic: string, tone: Tone, includeTags: boolean): Promise<ArticleContent> => {
  const systemInstruction = `You are Gemini, an advanced AI developed by Google. You are currently serving as an elite news architect for Samanyolu.com, a premium Turkish digital media portal.

Your identity:
- You are helpful, creative, and extremely knowledgeable.
- You write with precision and flair.

Task: Write a high-quality news article in Turkish.
Domain Expertise: Technology, Gaming, Space/Astronomy, Economy, and Entertainment.

Writing Guidelines:
- **Language**: Fluent, natural, professional Turkish.
- **Structure**:
  - Catchy Title (H1 equivalent).
  - Engagement Hook (Intro 2-3 sentences).
  - Clear Subheadings (H2, H3).
  - Concise paragraphs.
  - Bullet points/lists for readability.
  - Conclusion.
- **SEO**: Naturally integrate relevant keywords.
- **Tone**: Informative yet accessible (not overly academic).

Content Rules:
- **Length**: 500-700 words for standard news, up to 1200 for guides.
- **Dates**: Use Turkish format (e.g., "20 Eylül 2025").
- **Integrity**: Do not fabricate news. If facts are uncertain, provide context.

Output Format (JSON):
- Title
- Meta Description
- Content (Array of strings/HTML)
- Tags`;

  const prompt = `
    Topic: "${topic}"
    
    Please perform a Google Search to ensure the information is current.

    Requirements:
    - Tone: ${tone}
    - ${includeTags ? 'Generate 3-5 relevant tags.' : 'Tags should be empty.'}
    - Format lists with Markdown or HTML.

    Return ONLY a single valid JSON object:
    {
      "title": "string",
      "content": "string[] (paragraphs)",
      "metaDescription": "string",
      "tags": "string[]"
    }
  `;

  try {
    // Using Gemini 3 Pro for superior reasoning and creative capabilities
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
                // Basic heuristic for subheadings if not explicitly marked
                if (trimmedLine.length < 60 && !trimmedLine.endsWith('.') && !trimmedLine.endsWith('?')) {
                   htmlContent += `<h2>${trimmedLine}</h2>\n`;
                } else {
                   htmlContent += `<p>${trimmedLine}</p>\n`;
                }
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
      throw new Error(`Gemini content generation failed: ${e.message}`);
    }
    throw new Error("An unknown error occurred during content generation.");
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
      throw new Error("Gemini did not return any images. This can happen if the topic is sensitive and triggers safety filters. Please try a different topic or adjust the image style.");
    }
    
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);

  } catch (e) {
    console.error("Failed to generate article image:", e);
    if (e instanceof Error) {
        if (e.message.includes('API_KEY_INVALID')) {
             throw new Error("Image generation failed: The API key is invalid. Please check your configuration.");
        }
        throw new Error(`Imagen generation failed: ${e.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};


const fetchTopics = async (prompt: string): Promise<string[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
    throw new Error("Could not fetch trending topics from Gemini.");
  }
};

const baseTopicPrompt = "List 5 current and specific topics in";

export const fetchNationalTrendingTopics = () => fetchTopics(`${baseTopicPrompt} Turkish national news. Provide only real, significant, and recent events.`);
export const fetchWorldNewsTopics = () => fetchTopics(`${baseTopicPrompt} world news. Provide only real, significant, and recent events.`);
export const fetchTechTrendingTopics = () => fetchTopics(`${baseTopicPrompt} technology. Provide only real, significant, and recent topics.`);
export const fetchEconomyTopics = () => fetchTopics(`${baseTopicPrompt} global or national economy. Provide only real, significant, and recent topics.`);
export const fetchHealthTopics = () => fetchTopics(`${baseTopicPrompt} health and medicine. Provide only real, significant, and recent topics.`);
export const fetchScienceTopics = () => fetchTopics(`${baseTopicPrompt} science and astronomy. Provide only real, significant, and recent topics.`);
export const fetchEntertainmentTopics = () => fetchTopics(`${baseTopicPrompt} entertainment and pop culture. Provide only real, significant, and recent topics.`);
export const fetchHoroscopeTopics = () => fetchTopics("List 5 horoscope-related article ideas.");
export const fetchSportTrendingTopics = () => fetchTopics(`${baseTopicPrompt} sports. Provide only real, significant, and recent events.`);