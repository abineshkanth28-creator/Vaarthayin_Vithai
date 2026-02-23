
export enum Language {
  TAMIL = 'ta',
  ENGLISH = 'en'
}

export interface Message {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  duration: string;
  audioUrl: string; // Google Drive Direct Link
  thumbnail: string;
  subMessages?: Message[];
}

export interface DailyVerse {
  verse: string;
  reference: string;
}
