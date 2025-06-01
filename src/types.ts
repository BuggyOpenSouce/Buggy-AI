// project/src/types.ts
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
  bannerURL?: string;
  tempPhotoURL?: string;
  tempBannerURL?: string;
  lastUpdated: number;
  isProfileComplete: boolean;
  email: string;
  bio?: string;
}

export interface SidebarSettings {
  backgroundImage?: string;
}

export interface ImageGenerationLimit {
  count: number;
  lastReset: number;
  ipAddress: string;
}

export interface AISettings {
  maxTokens?: number;
  temperature?: number;
  importantPoints?: string[];
  discussedTopics?: Array<{ topic: string; discussed: boolean; lastDiscussedTimestamp?: number }>;
  companyName?: string;
}

export interface UISettings {
  selectedPrimaryColor?: string;
  showButtonBacklight?: boolean;
  showFullName?: boolean;
  showProfileNameInSidebar?: boolean;
  developerShowButtonBacklight?: boolean;
}

export interface JournalLogItem {
  timestamp: number;
  type: 'user' | 'assistant';
  content: string;
}

export interface DailyJournalEntry {
  date: string; // YYYY-MM-DD
  logs: JournalLogItem[];
}