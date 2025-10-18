
export enum Tone {
  Neutral = 'Neutral',
  Formal = 'Formal',
  Casual = 'Casual',
  Journalistic = 'Journalistic',
  Optimistic = 'Optimistic',
  Pessimistic = 'Pessimistic',
  Humorous = 'Humorous',
  Investigative = 'Investigative',
}

export enum ImageStyle {
  Photorealistic = 'Photorealistic',
  Illustration = 'Illustration',
  DigitalArt = 'Digital Art',
  Abstract = 'Abstract',
}

export interface Source {
  uri: string;
  title: string;
}

export interface ArticleContent {
  title: string;
  content: string;
  metaDescription: string;
  tags?: string[];
  sources?: Source[];
}

export interface Article extends ArticleContent {
  imageUrls: string[];
}

export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  password: string;
}

export enum PostStatus {
    Idle = 'Idle',
    UploadingImage = 'UploadingImage',
    Posting = 'Posting',
    Success = 'Success',
    Error = 'Error'
}

export enum WordPressPublicationStatus {
    Draft = 'draft',
    Publish = 'publish',
}

export interface WPMedia {
  id: number;
  source_url: string;
}