
import { WordPressCredentials, Article, WordPressPublicationStatus } from '../types';

/**
 * Converts a base64 string to a Blob object.
 * @param base64 The base64 encoded string (without the data: mime/type;base64, prefix).
 * @param contentType The MIME type of the content.
 * @returns A Blob object.
 */
const base64ToBlob = (base64: string, contentType: string = ''): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

const getSanitizedEndpoint = (siteUrl: string, path: string): string => {
    let endpoint = siteUrl.trim();
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        endpoint = 'https://' + endpoint;
    }
    endpoint = endpoint.replace(/\/$/, "");
    return endpoint + path;
}

const getAuthHeaders = (username: string, password: string ): Headers => {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(`${username}:${password}`));
    return headers;
}

const handleWordPressError = async (response: Response): Promise<Error> => {
    let errorMessage = `Request failed with status: ${response.status} ${response.statusText}`;
    try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            errorMessage = errorData.message;
            // Add more specific error for media upload permissions
            if (errorData.code === 'rest_cannot_create' && errorData.message.includes('sorry, you are not allowed to upload files')) {
                errorMessage = 'WordPress Permission Error: The specified user does not have permissions to upload files. Please check the user role in your WordPress dashboard.';
            }
             if (errorData.code === 'rest_cannot_publish') {
                errorMessage = 'WordPress Permission Error: The specified user does not have permission to publish posts. Please use the "Save as Draft" option or check that the user has the "Editor" or "Administrator" role.';
            }
        }
    } catch (jsonError) {
        console.warn("Could not parse WordPress error response as JSON.", jsonError);
    }
    return new Error(errorMessage);
};

export const uploadImageToWordPress = async (creds: WordPressCredentials, base64Image: string, filename: string): Promise<number> => {
  if (!base64Image.startsWith('data:image')) {
    throw new Error('Invalid image data format.');
  }

  const endpoint = getSanitizedEndpoint(creds.siteUrl, '/wp-json/wp/v2/media');
  
  const parts = base64Image.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const base64Data = parts[1];
  const blob = base64ToBlob(base64Data, contentType);

  const headers = getAuthHeaders(creds.username, creds.password);
  headers.append('Content-Type', contentType);
  headers.append('Content-Disposition', `attachment; filename="${filename}"`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: blob,
    });

    if (!response.ok) throw await handleWordPressError(response);
    
    const mediaData = await response.json();
    return mediaData.id;

  } catch (error) {
     console.error("Failed to upload image to WordPress:", error);
     if (error instanceof TypeError) {
         throw new Error("A network error occurred during image upload. Please check your Site URL, CORS settings, and internet connection.");
     }
     throw error;
  }
};


/**
 * Gets the ID of a category, creating it if it doesn't exist.
 * @param creds WordPress credentials.
 * @param categoryName The name of the category.
 * @returns A promise that resolves to the category ID, or null if an error occurs.
 */
const getOrCreateCategory = async (creds: WordPressCredentials, categoryName: string): Promise<number | null> => {
    const headers = getAuthHeaders(creds.username, creds.password);
    headers.append('Content-Type', 'application/json');

    try {
        // 1. Search for existing category by name. WP search is broad, so we fetch and filter.
        const searchEndpoint = getSanitizedEndpoint(creds.siteUrl, `/wp-json/wp/v2/categories?search=${encodeURIComponent(categoryName)}`);
        const searchResponse = await fetch(searchEndpoint, { headers });
        
        if (!searchResponse.ok) throw await handleWordPressError(searchResponse);
        
        const existingCategories = await searchResponse.json();
        const existingCategory = existingCategories.find((c: { name: string }) => c.name.toLowerCase() === categoryName.toLowerCase());

        if (existingCategory) {
            return existingCategory.id;
        } else {
            // 2. Create new category if not found
            const createEndpoint = getSanitizedEndpoint(creds.siteUrl, '/wp-json/wp/v2/categories');
            const createResponse = await fetch(createEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: categoryName }),
            });

            if (!createResponse.ok) throw await handleWordPressError(createResponse);
            
            const newCategory = await createResponse.json();
            return newCategory.id;
        }
    } catch (error) {
        console.error(`Failed to get or create category "${categoryName}":`, error);
        // Don't block posting if category creation fails
        return null;
    }
};

/**
 * Gets the IDs of existing tags or creates them if they don't exist.
 * @param creds WordPress credentials.
 * @param tagNames An array of tag names.
 * @returns A promise that resolves to an array of tag IDs.
 */
const getOrCreateTags = async (creds: WordPressCredentials, tagNames: string[]): Promise<number[]> => {
    const tagIds: number[] = [];
    const headers = getAuthHeaders(creds.username, creds.password);
    headers.append('Content-Type', 'application/json');

    for (const name of tagNames) {
        try {
            // 1. Search for existing tag
            const searchEndpoint = getSanitizedEndpoint(creds.siteUrl, `/wp-json/wp/v2/tags?search=${encodeURIComponent(name)}`);
            const searchResponse = await fetch(searchEndpoint, { headers });
            
            if (!searchResponse.ok) throw await handleWordPressError(searchResponse);
            
            const existingTags = await searchResponse.json();
            const existingTag = existingTags.find((t: { name: string }) => t.name.toLowerCase() === name.toLowerCase());

            if (existingTag) {
                tagIds.push(existingTag.id);
            } else {
                // 2. Create new tag if not found
                const createEndpoint = getSanitizedEndpoint(creds.siteUrl, '/wp-json/wp/v2/tags');
                const createResponse = await fetch(createEndpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ name }),
                });

                if (!createResponse.ok) throw await handleWordPressError(createResponse);
                
                const newTag = await createResponse.json();
                tagIds.push(newTag.id);
            }
        } catch (error) {
            console.error(`Failed to get or create tag "${name}":`, error);
            // Continue without this tag if an error occurs
        }
    }
    return tagIds;
};

export const postToWordPress = async (creds: WordPressCredentials, article: Article, featuredMediaId: number | null, setHaberCategory: boolean, publishStatus: WordPressPublicationStatus): Promise<string> => {
  const { siteUrl, username, password } = creds;

  if (!siteUrl || !username || !password) {
    throw new Error("WordPress credentials are not complete.");
  }
  
  const endpoint = getSanitizedEndpoint(siteUrl, '/wp-json/wp/v2/posts');
  const headers = getAuthHeaders(username, password);
  headers.append('Content-Type', 'application/json');

  const contentHtml = article.content.map(p => `<p>${p}</p>`).join('\n\n');
  
  const postBody: {
    title: string;
    content: string;
    status: string;
    excerpt?: string;
    featured_media?: number;
    tags?: number[];
    categories?: number[];
  } = {
    title: article.title,
    content: contentHtml,
    status: publishStatus,
    excerpt: article.metaDescription,
  };

  if (featuredMediaId) {
    postBody.featured_media = featuredMediaId;
  }

  if (setHaberCategory) {
      const categoryId = await getOrCreateCategory(creds, "Haber");
      if (categoryId) {
          postBody.categories = [categoryId];
      }
  }
  
  if (article.tags && article.tags.length > 0) {
    const tagIds = await getOrCreateTags(creds, article.tags);
    if(tagIds.length > 0) {
      postBody.tags = tagIds;
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody),
    });

    if (!response.ok) throw await handleWordPressError(response);
    
    const postData = await response.json();
    return postData.link;

  } catch (error) {
    console.error("Failed to post to WordPress:", error);
    if (error instanceof TypeError) {
        throw new Error("A network error occurred while posting. Please check your Site URL, CORS settings, and internet connection.");
    }
    throw error;
  }
};
