// project/src/hooks/useDataSync.ts
import { useCallback } from 'react';
import { syncUserData as supabaseSyncUserData, getUserData as supabaseGetUserData } from '../utils/supabase';
import type { Chat, UserProfile, Theme, SidebarSettings, AISettings, UISettings, DailyJournalEntry } from '../types'; // DailyJournalEntry import edildi

// Senkronize edilecek ve yüklenecek verilerin tipini tanımla
export interface SyncedData {
  chats?: Chat[];
  userProfile?: UserProfile | null;
  theme?: Theme;
  splashGif?: string;
  sidebarSettings?: SidebarSettings;
  uiSettings?: UISettings;
  aiSettings?: AISettings;
  aiJournal?: DailyJournalEntry[]; // Günlük eklendi
}

export function useDataSync(uid: string | undefined) {
  const syncData = useCallback(async (dataToSync: SyncedData) => {
    if (!uid) {
      console.warn('UID tanımlı değil, senkronizasyon atlanıyor.');
      return;
    }
    try {
      await supabaseSyncUserData(uid, dataToSync);
    } catch (error) {
      console.error('useDataSync - syncData hatası:', error);
    }
  }, [uid]);

  const loadData = useCallback(async (): Promise<SyncedData | null> => {
    if (!uid) {
      console.warn('UID tanımlı değil, veri yükleme atlanıyor.');
      return null;
    }
    try {
      const data = await supabaseGetUserData(uid);
      if (data) {
        // localStorage'ı güncelle (App.tsx bu güncellemeyi state'e yansıtacak veya zaten yapıyor)
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        });
        return data as SyncedData; // App.tsx'in kullanması için veriyi döndür
      }
      return null;
    } catch (error) {
      console.error('useDataSync - loadData hatası:', error);
      return null;
    }
  }, [uid]);

  return { syncData, loadData };
}