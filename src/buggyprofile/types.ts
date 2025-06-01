export interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
      role: string;
      explanation?: string;
    };
  }[];
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  id?: string;
  buid: string;
  nickname: string;
  birthDate: string;
  interests: string[];
  photoURL?: string;
  lastUpdated: number;
  isProfileComplete: boolean;
  email: string;
}

export interface SidebarSettings {
  backgroundImage?: string;
}

export interface ImageGenerationLimit {
  count: number;
  lastReset: number;
  ipAddress: string;
}