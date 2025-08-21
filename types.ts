
export enum Tone {
  Neutral = 'Neutral',
  Formal = 'Formal',
  Casual = 'Casual',
  Journalistic = 'Journalistic',
  Optimistic = 'Optimistic',
  Pessimistic = 'Pessimistic',
}

export interface ArticleContent {
  title: string;
  content: string[];
  metaDescription: string;
  tags?: string[];
}

export interface Article extends ArticleContent {
  imageUrl: string | null;
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
