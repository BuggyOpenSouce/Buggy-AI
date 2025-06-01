// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { Settings } from './components/Settings';
import { SplashScreen } from './components/SplashScreen';
import { DeveloperSettings } from './components/DeveloperSettings';
import { QuestionChat } from './QuestionGeneration/QuestionChat';
import { ImageChat } from './components/ImageChat';
import { BetaEndedScreen } from './components/BetaEndedScreen';
import { Menu, Loader2 } from 'lucide-react';
import { getBetaTestEnded } from './betatoggle';
import { OfflineMode } from './components/OfflineMode';
import { VersionDisplay } from './components/VersionDisplay';
import { ProfileMenu } from './buggyprofile/components/ProfileMenu';
import { useDataSync, SyncedData } from './hooks/useDataSync';
import type { Chat, Theme, UserProfile, SidebarSettings, Message, AISettings, DailyJournalEntry, JournalLogItem, UISettings, ChatMetadata } from './types';
import { supabase } from './utils/supabase';

function App() {
  const [chatListMeta, setChatListMeta] = useState<ChatMetadata[]>([]);
  const [activeChatDetail, setActiveChatDetail] = useState<Chat | null>(null);
  const [isChatContentLoading, setIsChatContentLoading] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [splashGif, setSplashGif] = useState<string>(() => localStorage.getItem('splashGif') || '');
  const [showSidebar, setShowSidebar] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [sidebarSettings, setSidebarSettings] = useState<SidebarSettings>(() => {
    const saved = localStorage.getItem('sidebarSettings');
    return saved ? JSON.parse(saved) : {};
  });

  // 'journal' state'i burada tanımlanıyor ve AI'nin anıları için kullanılıyor.
  const [journal, setJournal] = useState<DailyJournalEntry[]>(() => {
    const savedJournal = localStorage.getItem('aiJournal'); // localStorage'da 'aiJournal' anahtarıyla saklanıyor
    return savedJournal ? JSON.parse(savedJournal) : [];
  });

  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('aiSettings');
    const defaults: AISettings = { maxTokens: 2048, temperature: 0.7, importantPoints: [], discussedTopics: [], companyName: 'BuggyCompany' };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed, discussedTopics: parsed.discussedTopics || [] };
    }
    return defaults;
  });

  const [uiSettings, setUISettings] = useState<UISettings>(() => {
    const saved = localStorage.getItem('uiSettings');
    return saved ? JSON.parse(saved) : { showButtonBacklight: true, showFullName: false, showProfileNameInSidebar: true, developerShowButtonBacklight: true };
  });

  const [isQuestionChat, setIsQuestionChat] = useState(false);
  const [isImageChat, setIsImageChat] = useState(false);
  const [betaEnded, setBetaEnded] = useState(() => getBetaTestEnded());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { syncData, loadData: loadSyncedData } = useDataSync(userProfile?.buid);

  useEffect(() => {
    const initialLoad = async () => {
      setIsAppLoading(true);
      if (userProfile?.buid) {
        const syncedData = await loadSyncedData();
        if (syncedData) {
          if (syncedData.chats) {
            setChatListMeta(syncedData.chats.map(c => ({ id: c.id, title: c.title })));
          } else {
            setChatListMeta([]);
          }
          if (syncedData.userProfile) setUserProfile(syncedData.userProfile);
          if (syncedData.theme) setTheme(syncedData.theme);
          if (syncedData.splashGif) setSplashGif(syncedData.splashGif);
          if (syncedData.sidebarSettings) setSidebarSettings(syncedData.sidebarSettings);
          // Gelen veride 'aiJournal' varsa 'journal' state'ini güncelle
          if (syncedData.aiJournal) setJournal(syncedData.aiJournal);
          if (syncedData.aiSettings) {
            setAISettings(prev => ({ ...prev, ...syncedData.aiSettings, discussedTopics: syncedData.aiSettings?.discussedTopics || prev.discussedTopics || [] }));
          }
          if (syncedData.uiSettings) setUISettings(syncedData.uiSettings);
        } else {
          setChatListMeta([]);
        }
      } else {
        const localTheme = localStorage.getItem('theme') as Theme;
        if (localTheme) setTheme(localTheme);
        const localSplash = localStorage.getItem('splashGif');
        if (localSplash) setSplashGif(localSplash);
        const localSidebarSettings = localStorage.getItem('sidebarSettings');
        if (localSidebarSettings) setSidebarSettings(JSON.parse(localSidebarSettings));
        const localAISettings = localStorage.getItem('aiSettings');
        if (localAISettings) {
            const parsed = JSON.parse(localAISettings);
            const defaults: AISettings = { maxTokens: 2048, temperature: 0.7, importantPoints: [], discussedTopics: [], companyName: 'BuggyCompany' };
            setAISettings({...defaults, ...parsed, discussedTopics: parsed.discussedTopics || [] });
        }
        const localUISettings = localStorage.getItem('uiSettings');
        if (localUISettings) setUISettings(JSON.parse(localUISettings));
        // Kullanıcı girişi yoksa localStorage'dan 'aiJournal' yükle
        const savedJournalLocal = localStorage.getItem('aiJournal');
        if (savedJournalLocal) setJournal(JSON.parse(savedJournalLocal));
        setChatListMeta([]);
      }
      setIsAppLoading(false);
    };
    initialLoad();
  }, [userProfile?.buid, loadSyncedData]);

  useEffect(() => { localStorage.setItem('theme', theme); document.documentElement.className = theme; }, [theme]);
  useEffect(() => { localStorage.setItem('splashGif', splashGif); }, [splashGif]);
  useEffect(() => {
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
    else localStorage.removeItem('userProfile');
  }, [userProfile]);
  useEffect(() => { localStorage.setItem('sidebarSettings', JSON.stringify(sidebarSettings)); }, [sidebarSettings]);
  useEffect(() => { localStorage.setItem('aiSettings', JSON.stringify(aiSettings)); }, [aiSettings]);
  useEffect(() => {
    localStorage.setItem('uiSettings', JSON.stringify(uiSettings));
    document.documentElement.classList.toggle('button-backlight-enabled', !!uiSettings.developerShowButtonBacklight);
  }, [uiSettings]);
  // 'journal' state'i değiştiğinde localStorage'daki 'aiJournal'ı güncelle
  useEffect(() => { localStorage.setItem('aiJournal', JSON.stringify(journal)); }, [journal]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const isTwilightEnabled = localStorage.getItem('devTwilightTheme') === 'true';
    document.documentElement.classList.toggle('twilight', isTwilightEnabled);
  }, []);

  const addJournalLog = useCallback((type: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return;
    setJournal(prevJournal => {
      const today = new Date();
      const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const newLog: JournalLogItem = { timestamp: Date.now(), type, content };
      const existingEntryIndex = prevJournal.findIndex(entry => entry.date === todayDateString);
      if (existingEntryIndex > -1) {
        const updatedJournal = [...prevJournal];
        updatedJournal[existingEntryIndex].logs.push(newLog);
        return updatedJournal;
      } else {
        return [...prevJournal, { date: todayDateString, logs: [newLog] }];
      }
    });
  }, []);

  const getMessagesForChat = async (uid: string | undefined, chatId: string): Promise<Message[]> => {
    if (!uid) return [];
    try {
      const fullData = await supabase.from('user_data').select('data').eq('uid', uid).single();
      if (fullData.error) throw fullData.error;
      const chatsInData = fullData.data?.data?.chats as Chat[] | undefined;
      const targetChat = chatsInData?.find(c => c.id === chatId);
      return targetChat?.messages || [];
    } catch (error) {
      console.error("Error fetching messages for chat:", chatId, error);
      return [];
    }
  };

  const handleSelectChat = useCallback(async (id: string) => {
    if (activeChatDetail?.id === id) {
      setShowSidebar(false);
      setIsQuestionChat(false);
      setIsImageChat(false);
      return;
    }
    setIsChatContentLoading(true);
    setActiveChatDetail(null);
    try {
      const messages = await getMessagesForChat(userProfile?.buid, id);
      const chatMeta = chatListMeta.find(c => c.id === id);
      if (chatMeta) {
        setActiveChatDetail({ ...chatMeta, messages });
      } else {
        setActiveChatDetail({ id, title: "Sohbet Yükleniyor...", messages });
      }
    } catch (error) {
      console.error("Sohbet yüklenirken hata:", error);
      const chatMeta = chatListMeta.find(c => c.id === id);
      setActiveChatDetail({ id, title: chatMeta?.title || "Hata", messages: [{role: 'assistant', content: 'Sohbet yüklenemedi.', timestamp: Date.now()}] });
    } finally {
      setIsChatContentLoading(false);
      setShowSidebar(false);
      setIsQuestionChat(false);
      setIsImageChat(false);
    }
  }, [userProfile?.buid, chatListMeta, activeChatDetail?.id]);

  const buildDataToSync = useCallback((updatedChatListMeta: ChatMetadata[], updatedActiveChatDetail: Chat | null): SyncedData => {
    return {
      chats: updatedChatListMeta.map(meta => ({
        id: meta.id,
        title: meta.title,
        messages: updatedActiveChatDetail?.id === meta.id ? updatedActiveChatDetail.messages : []
      })),
      userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'), // Güncel userProfile state'ini kullanmak daha iyi olabilir
      theme: (localStorage.getItem('theme') as Theme | null) || undefined,
      splashGif: localStorage.getItem('splashGif') || undefined,
      sidebarSettings: JSON.parse(localStorage.getItem('sidebarSettings') || '{}'),
      uiSettings: JSON.parse(localStorage.getItem('uiSettings') || '{}'),
      aiSettings: JSON.parse(localStorage.getItem('aiSettings') || '{}'),
      aiJournal: journal // 'journal' state'ini doğrudan kullan
    };
  }, [journal]); // 'journal' state'i dependency olarak eklendi


  const handleCreateChat = useCallback(async () => {
    const newChatMeta: ChatMetadata = { id: nanoid(), title: 'Yeni Sohbet' };
    const newActiveChatDetail: Chat = { ...newChatMeta, messages: [] };
    
    setChatListMeta(prev => [newChatMeta, ...prev]);
    setActiveChatDetail(newActiveChatDetail);
    setIsChatContentLoading(false);
    setShowSidebar(false);
    setIsQuestionChat(false);
    setIsImageChat(false);

    if (userProfile?.buid) {
      const updatedFullChatList = [newChatMeta, ...chatListMeta];
      await syncData(buildDataToSync(updatedFullChatList, newActiveChatDetail));
    }
  }, [userProfile?.buid, syncData, chatListMeta, buildDataToSync]);

  const handleDeleteChat = useCallback(async (idToDelete: string) => {
    const newChatListMetaState = chatListMeta.filter(chat => chat.id !== idToDelete);
    setChatListMeta(newChatListMetaState);

    let nextActiveChatDetail: Chat | null = null;
    if (activeChatDetail?.id === idToDelete) {
      setActiveChatDetail(null);
      if (newChatListMetaState.length > 0) {
        // Otomatik olarak ilk sohbete geç ve mesajlarını yükle
        setIsChatContentLoading(true);
        const messages = await getMessagesForChat(userProfile?.buid, newChatListMetaState[0].id);
        nextActiveChatDetail = { ...newChatListMetaState[0], messages };
        setActiveChatDetail(nextActiveChatDetail);
        setIsChatContentLoading(false);
      }
    } else {
      nextActiveChatDetail = activeChatDetail;
    }

    if (userProfile?.buid) {
      await syncData(buildDataToSync(newChatListMetaState, nextActiveChatDetail));
    }
  }, [chatListMeta, activeChatDetail, userProfile?.buid, syncData, buildDataToSync]);

  const handleRenameChat = useCallback(async (idToRename: string, newTitle: string) => {
    const newChatListMetaState = chatListMeta.map(chat =>
      chat.id === idToRename ? { ...chat, title: newTitle } : chat
    );
    setChatListMeta(newChatListMetaState);

    let currentActiveChat = activeChatDetail;
    if (activeChatDetail?.id === idToRename) {
      currentActiveChat = activeChatDetail ? { ...activeChatDetail, title: newTitle } : null;
      setActiveChatDetail(currentActiveChat);
    }
    if (userProfile?.buid) {
      await syncData(buildDataToSync(newChatListMetaState, currentActiveChat));
    }
  }, [chatListMeta, activeChatDetail, userProfile?.buid, syncData, buildDataToSync]);

  const handleUpdateActiveChatMessages = useCallback(async (newMessages: Message[]) => {
    if (!activeChatDetail) return;
    const updatedChatDetail = { ...activeChatDetail, messages: newMessages };
    setActiveChatDetail(updatedChatDetail);

    if (userProfile?.buid) {
      await syncData(buildDataToSync(chatListMeta, updatedChatDetail));
    }
  }, [activeChatDetail, chatListMeta, userProfile?.buid, syncData, buildDataToSync]);


  const handleUpdateAISettings = useCallback((updates: Partial<AISettings> | ((prevState: AISettings) => AISettings)) => {
    setAISettings(prev => {
        const newSettings = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
        newSettings.discussedTopics = newSettings.discussedTopics || [];
        return newSettings;
    });
  }, []);

  const handleUpdateUISettings = useCallback((updates: Partial<UISettings> | ((prevState: UISettings) => UISettings)) => {
    setUISettings(prev => typeof updates === 'function' ? updates(prev) : { ...prev, ...updates });
  }, []);

  const handleUpdateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      const baseProfile = prevProfile || { buid: nanoid(), nickname: 'Guest', email: '', isProfileComplete: false, interests: [], birthDate: '', lastUpdated: Date.now() };
      const updatedProfile = { ...baseProfile, ...updates, lastUpdated: Date.now() };
      if (!prevProfile?.isProfileComplete && updatedProfile.nickname !== 'Guest' && updatedProfile.email && updatedProfile.birthDate) {
        updatedProfile.isProfileComplete = true;
      }
      if (updates.interests && prevProfile) {
        const oldInterests = prevProfile.interests || [];
        const newInterestsAdded = updates.interests.filter(interest => !oldInterests.some(oi => oi.toLowerCase() === interest.toLowerCase()));
        if (newInterestsAdded.length > 0) {
          handleUpdateAISettings(prevAISettings => {
            const currentDiscussedTopics = prevAISettings.discussedTopics || [];
            const topicsToSync = newInterestsAdded.filter(interest => !currentDiscussedTopics.some(dt => dt.topic.toLowerCase() === interest.toLowerCase()));
            return topicsToSync.length > 0 ? { ...prevAISettings, discussedTopics: [...currentDiscussedTopics, ...topicsToSync.map(topic => ({ topic, discussed: false, lastDiscussedTimestamp: Date.now() }))] } : prevAISettings;
          });
        }
      }
      return updatedProfile;
    });
  }, [handleUpdateAISettings]);

  const handleSaveChatFromFeature = useCallback(async (title: string, messages: Message[]) => {
    const newChatMeta: ChatMetadata = { id: nanoid(), title };
    const newActiveChat: Chat = { ...newChatMeta, messages };

    const updatedChatListMeta = [newChatMeta, ...chatListMeta];
    setChatListMeta(updatedChatListMeta);
    setActiveChatDetail(newActiveChat);
    setIsQuestionChat(false);
    setIsImageChat(false);

    if (userProfile?.buid) {
      await syncData(buildDataToSync(updatedChatListMeta, newActiveChat));
    }
  }, [userProfile?.buid, syncData, chatListMeta, buildDataToSync]);

  const handleToggleQuestionChat = () => {
    setIsQuestionChat(prev => !prev);
    setIsImageChat(false);
    if (!isQuestionChat) setActiveChatDetail(null);
  };

  const handleToggleImageChat = () => { // imageData parametresi kaldırıldı, ImageChat kendi içinde yönetecek
    const targetIsImageChatState = !isImageChat;
    setIsImageChat(targetIsImageChatState);
    setIsQuestionChat(false);
    setActiveChatDetail(null); // Her zaman aktif sohbeti temizle
    // ImageChat artık onSaveChat ile yeni sohbet oluşturacak
  };

  const handleUpdateSidebarBackground = useCallback((url: string) => {
    setSidebarSettings(prev => ({ ...prev, backgroundImage: url }));
  }, []);
  const handleUpdateSplashScreen = useCallback((url: string) => {
    setSplashGif(url);
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!userProfile?.buid) {
      alert("Lütfen önce giriş yapın veya bir misafir profili oluşturun.");
      return;
    }
    try {
      await syncData(buildDataToSync(chatListMeta, activeChatDetail));
      alert('Veriler başarıyla senkronize edildi!');
    } catch (error) {
      console.error('Manual sync error:', error);
      alert('Veri senkronizasyonu sırasında bir hata oluştu.');
    }
  }, [userProfile?.buid, syncData, chatListMeta, activeChatDetail, buildDataToSync]);

  if (betaEnded) return <BetaEndedScreen />;
  if (isAppLoading && !userProfile?.buid) { // Sadece kullanıcı girişi yokken ve app yükleniyorsa splash göster
      return <SplashScreen splashGif={splashGif} userProfile={userProfile} isLoading={true} companyName={aiSettings.companyName} />;
  }


  return (
    <div className="relative h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SplashScreen splashGif={splashGif} userProfile={userProfile} isLoading={isAppLoading} companyName={aiSettings.companyName}/>
      <OfflineMode isOffline={isOffline} />
      {showSettings && <div className="settings-overlay" onClick={() => setShowSettings(false)} />}
      {!showSidebar && (
        <button onClick={() => setShowSidebar(true)} className="hamburger-button button-backlight">
          <Menu className="w-6 h-6" />
        </button>
      )}
      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}
      
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <ChatList
            chats={chatListMeta}
            activeChat={activeChatDetail?.id || ''}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            sidebarSettings={sidebarSettings}
            theme={theme}
            setTheme={setTheme}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onToggleQuestionChat={handleToggleQuestionChat}
            onToggleImageChat={handleToggleImageChat}
            isQuestionChat={isQuestionChat}
            isImageChat={isImageChat}
            onOpenDevSettings={() => setShowDevSettings(true)}
            onUpdateSidebarBackground={handleUpdateSidebarBackground}
            onUpdateSplashScreen={handleUpdateSplashScreen}
            userProfile={userProfile}
            onOpenProfile={() => setShowProfile(true)}
            uiSettings={uiSettings}
        />
      </div>

      <div className="h-full">
        {isQuestionChat ? (
          <QuestionChat onSaveChat={handleSaveChatFromFeature} isQuestionChat={isQuestionChat}/>
        ) : isImageChat ? (
          <ImageChat onSaveChat={handleSaveChatFromFeature} />
        ) : isChatContentLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        ) : activeChatDetail ? (
          <ChatWindow
            key={activeChatDetail.id}
            chat={activeChatDetail}
            onUpdateChat={handleUpdateActiveChatMessages}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            isOffline={isOffline}
            aiSettings={aiSettings}
            addJournalLog={addJournalLog}
            journal={journal}
            syncData={syncData}
            isLoadingContent={isChatContentLoading}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
               <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                 {chatListMeta.length > 0 ? "Sohbet seçin veya yeni bir tane oluşturun." : "Henüz sohbet yok"}
                </h2>
               <button onClick={handleCreateChat} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors button-backlight">
                 Yeni Sohbet Oluştur
               </button>
            </div>
          </div>
        )}
      </div>

      <ProfileMenu
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onOpenDevSettings={() => setShowDevSettings(true)}
      />
      {showSettings && (
         <Settings
            theme={theme} setTheme={setTheme} isOpen={showSettings} onToggle={() => setShowSettings(false)}
            onSplashScreenChange={handleUpdateSplashScreen} onSidebarBackgroundChange={handleUpdateSidebarBackground}
            sidebarSettings={sidebarSettings} userProfile={userProfile} onManualSync={handleManualSync} isOffline={isOffline}
            onOpenDevSettings={() => setShowDevSettings(true)}
        />
      )}
      {showDevSettings && (
        <DeveloperSettings
          isOpen={showDevSettings} onClose={() => setShowDevSettings(false)}
          aiSettings={aiSettings} onUpdateAISettings={handleUpdateAISettings}
          uiSettings={uiSettings} onUpdateUISettings={handleUpdateUISettings}
        />
      )}
      <VersionDisplay />
    </div>
  );
}

export default App;