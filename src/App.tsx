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
import { Menu, Loader2 } from 'lucide-react'; // Loader2 eklendi
import { getBetaTestEnded } from './betatoggle';
import { OfflineMode } from './components/OfflineMode';
import { VersionDisplay } from './components/VersionDisplay';
import { ProfileMenu } from './buggyprofile/components/ProfileMenu';
// import { app, analytics } from './firebase'; // Firebase app ve analytics kullanılmıyorsa kaldırılabilir
import { useDataSync, SyncedData } from './hooks/useDataSync';
import type { Chat, Theme, UserProfile, SidebarSettings, Message, AISettings, DailyJournalEntry, UISettings, ChatMetadata } from './types';
import { supabase } from './utils/supabase'; // Supabase client doğrudan kullanılabilir

function App() {
  const [chatListMeta, setChatListMeta] = useState<ChatMetadata[]>([]);
  const [activeChatDetail, setActiveChatDetail] = useState<Chat | null>(null);
  const [isChatContentLoading, setIsChatContentLoading] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true); // Uygulama ilk yüklenirken

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

  const [journal, setJournal] = useState<DailyJournalEntry[]>(() => {
    const savedJournal = localStorage.getItem('aiJournal');
    return savedJournal ? JSON.parse(savedJournal) : [];
  });

  const [isQuestionChat, setIsQuestionChat] = useState(false);
  const [isImageChat, setIsImageChat] = useState(false);
  const [betaEnded, setBetaEnded] = useState(() => getBetaTestEnded());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { syncData, loadData: loadSyncedData } = useDataSync(userProfile?.buid);

  // Verileri yükle
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
          if (syncedData.aiJournal) setJournal(syncedData.aiJournal);
          if (syncedData.aiSettings) {
            setAISettings(prev => ({ ...prev, ...syncedData.aiSettings, discussedTopics: syncedData.aiSettings?.discussedTopics || prev.discussedTopics || [] }));
          }
          if (syncedData.uiSettings) setUISettings(syncedData.uiSettings);
        } else {
          setChatListMeta([]); // Supabase'den veri gelmezse veya hata olursa listeyi boşalt
        }
      } else {
        // Kullanıcı girişi yoksa localStorage'dan sadece ayarları yükle, sohbetleri yükleme
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
        const savedJournalLocal = localStorage.getItem('aiJournal');
        if (savedJournalLocal) setJournal(JSON.parse(savedJournalLocal));
        setChatListMeta([]); // Kullanıcı yoksa sohbet listesi boş
      }
      setIsAppLoading(false);
    };
    initialLoad();
  }, [userProfile?.buid, loadSyncedData]);


  // localStorage etkileşimleri (sohbetler hariç)
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
      // Supabase'den tüm veriyi çekip ilgili sohbetin mesajlarını filtrele
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
    setActiveChatDetail(null); // Önceki sohbeti temizle

    try {
      const messages = await getMessagesForChat(userProfile?.buid, id);
      const chatMeta = chatListMeta.find(c => c.id === id);
      if (chatMeta) {
        setActiveChatDetail({ ...chatMeta, messages });
      } else {
        // Bu durum, chatListMeta'nın güncel olmadığı anlamına gelebilir, nadir olmalı
        setActiveChatDetail({ id, title: "Sohbet Yükleniyor...", messages });
      }
    } catch (error) {
      console.error("Sohbet yüklenirken hata:", error);
      // Hata durumunda kullanıcıya bilgi verilebilir
      const chatMeta = chatListMeta.find(c => c.id === id);
      setActiveChatDetail({ id, title: chatMeta?.title || "Hata", messages: [{role: 'assistant', content: 'Sohbet yüklenemedi.', timestamp: Date.now()}] });
    } finally {
      setIsChatContentLoading(false);
      setShowSidebar(false);
      setIsQuestionChat(false);
      setIsImageChat(false);
    }
  }, [userProfile?.buid, chatListMeta, activeChatDetail?.id]);

  const handleCreateChat = useCallback(async () => {
    const newChatMeta: ChatMetadata = { id: nanoid(), title: 'Yeni Sohbet' };
    setChatListMeta(prev => [newChatMeta, ...prev]); // Yeni sohbeti listenin başına ekle
    
    setActiveChatDetail({ ...newChatMeta, messages: [] });
    setIsChatContentLoading(false); // Yeni sohbet için yükleme durumu olmaz
    
    setShowSidebar(false);
    setIsQuestionChat(false);
    setIsImageChat(false);

    if (userProfile?.buid) {
      const dataToSync: SyncedData = {
        chats: [newChatMeta, ...chatListMeta].map(meta => ({ // Tüm meta listesini al, yeni eklenenle birlikte
             id: meta.id, 
             title: meta.title, 
             messages: meta.id === newChatMeta.id ? [] : [] // Yeni sohbet boş, diğerleri de senkronizasyonda boş
        })),
        userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal
      };
      await syncData(dataToSync);
    }
  }, [userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal, syncData, chatListMeta]);

  const handleDeleteChat = useCallback(async (idToDelete: string) => {
    const newChatListMeta = chatListMeta.filter(chat => chat.id !== idToDelete);
    setChatListMeta(newChatListMeta);

    if (activeChatDetail?.id === idToDelete) {
      setActiveChatDetail(null); // Aktif sohbet silindiyse temizle
    }

    if (userProfile?.buid) {
      const dataToSync: SyncedData = {
        chats: newChatListMeta.map(meta => ({ id: meta.id, title: meta.title, messages: [] })),
        userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal
      };
      await syncData(dataToSync);
    }
  }, [chatListMeta, activeChatDetail, userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal, syncData]);

  const handleRenameChat = useCallback(async (idToRename: string, newTitle: string) => {
    const newChatListMeta = chatListMeta.map(chat =>
      chat.id === idToRename ? { ...chat, title: newTitle } : chat
    );
    setChatListMeta(newChatListMeta);

    if (activeChatDetail?.id === idToRename) {
      setActiveChatDetail(prev => prev ? { ...prev, title: newTitle } : null);
    }
    if (userProfile?.buid) {
      const dataToSync: SyncedData = {
        chats: newChatListMeta.map(meta => ({
          id: meta.id,
          title: meta.title,
          messages: meta.id === activeChatDetail?.id ? activeChatDetail.messages : []
        })),
        userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal
      };
      await syncData(dataToSync);
    }
  }, [chatListMeta, activeChatDetail, userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal, syncData]);

  const handleUpdateActiveChatMessages = useCallback(async (newMessages: Message[]) => {
    if (!activeChatDetail) return;

    const updatedChatDetail = { ...activeChatDetail, messages: newMessages };
    setActiveChatDetail(updatedChatDetail);

    if (userProfile?.buid && activeChatDetail.id) {
      const dataToSync: SyncedData = {
        chats: chatListMeta.map(meta => ({
          id: meta.id,
          title: meta.title,
          messages: meta.id === activeChatDetail.id ? newMessages : []
        })),
        userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal
      };
      await syncData(dataToSync);
    }
  }, [activeChatDetail, chatListMeta, userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal, syncData]);


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
    setChatListMeta(prev => [newChatMeta, ...prev]);
    setActiveChatDetail({ ...newChatMeta, messages }); // Yeni sohbeti aktif yap
    setIsQuestionChat(false); // Özellik sohbetlerini kapat
    setIsImageChat(false);

    if (userProfile?.buid) {
      const dataToSync: SyncedData = {
        chats: [{ ...newChatMeta, messages }, ...chatListMeta].map(meta => ({
          id: meta.id,
          title: meta.title,
          // Aktif olanın mesajlarını ekle, diğerleri için Supabase'deki durumu koru (veya boş gönder)
          messages: meta.id === newChatMeta.id ? messages : [] 
        })),
        userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal
      };
      await syncData(dataToSync);
    }
  }, [userProfile, theme, splashGif, sidebarSettings, uiSettings, aiSettings, aiJournal, syncData, chatListMeta]);


  const handleToggleQuestionChat = () => {
    setIsQuestionChat(prev => !prev);
    setIsImageChat(false);
    if (!isQuestionChat) setActiveChatDetail(null);
  };

  const handleToggleImageChat = (imageData?: string) => {
    const targetIsImageChatState = !isImageChat;
    setIsImageChat(targetIsImageChatState);
    setIsQuestionChat(false);
    if (targetIsImageChatState) {
      setActiveChatDetail(null);
      if (imageData) { // Resim sohbeti için yeni bir sohbet oluştur ve aktif et
          const newChat: Chat = {
            id: nanoid(), title: 'Resim Üretimi', messages: [{
              role: 'user', content: 'Üzerinde tartışılacak veya başlanacak resim:',
              images: [imageData], timestamp: Date.now()
            }]
          };
          setChatListMeta(prev => [ {id: newChat.id, title: newChat.title}, ...prev]);
          setActiveChatDetail(newChat);
      }
    } else {
      // Eğer resim sohbetinden çıkılıyorsa, ve bir önceki aktif sohbet varsa ona dön, yoksa boş kalsın
      const firstRegularChatMeta = chatListMeta.find(c => c.id !== activeChatDetail?.id || !isImageChat);
      if (firstRegularChatMeta) {
        handleSelectChat(firstRegularChatMeta.id);
      } else {
        setActiveChatDetail(null);
      }
    }
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
      // Senkronizasyon için tüm verileri localStorage'dan topla
      const dataToSync: SyncedData = {
        chats: chatListMeta.map(meta => ({ // Sadece meta verileri veya aktif olanın mesajlarını ekle
            id: meta.id,
            title: meta.title,
            messages: meta.id === activeChatDetail?.id ? activeChatDetail.messages : []
        })),
        userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'),
        theme: (localStorage.getItem('theme') as Theme | null) || undefined,
        splashGif: localStorage.getItem('splashGif') || undefined,
        sidebarSettings: JSON.parse(localStorage.getItem('sidebarSettings') || '{}'),
        uiSettings: JSON.parse(localStorage.getItem('uiSettings') || '{}'),
        aiSettings: JSON.parse(localStorage.getItem('aiSettings') || '{}'),
        aiJournal: JSON.parse(localStorage.getItem('aiJournal') || '[]')
      };
      await syncData(dataToSync);
      alert('Veriler başarıyla senkronize edildi!');
    } catch (error) {
      console.error('Manual sync error:', error);
      alert('Veri senkronizasyonu sırasında bir hata oluştu.');
    }
  }, [userProfile?.buid, syncData, chatListMeta, activeChatDetail]);


  if (betaEnded) return <BetaEndedScreen />;
  if (isAppLoading) return <SplashScreen splashGif={splashGif} userProfile={userProfile} isLoading={true} companyName={aiSettings.companyName} />;


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
            key={activeChatDetail.id} // Important for re-mount on chat change
            chat={activeChatDetail}
            onUpdateChat={handleUpdateActiveChatMessages} // This will now update messages for the active chat
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            isOffline={isOffline}
            aiSettings={aiSettings}
            addJournalLog={addJournalLog}
            journal={journal}
            syncData={syncData}
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