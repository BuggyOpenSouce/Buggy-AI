// project/src/App.tsx
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
import { Menu } from 'lucide-react';
import { getBetaTestEnded } from './betatoggle';
import { OfflineMode } from './components/OfflineMode';
import { VersionDisplay } from './components/VersionDisplay';
import { ProfileMenu } from './buggyprofile/components/ProfileMenu';
import { app, analytics } from './firebase';
import { useDataSync, SyncedData } from './hooks/useDataSync';
import type { Chat, Theme, UserProfile, SidebarSettings, Message, AISettings, DailyJournalEntry, JournalLogItem, UISettings } from './types';

function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  
  const [activeChat, setActiveChat] = useState(() => chats[0]?.id || '');
  
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
    const defaults: AISettings = {
      maxTokens: 2048, temperature: 0.7, importantPoints: [], discussedTopics: [], companyName: 'BuggyCompany'
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed, discussedTopics: parsed.discussedTopics || [] };
    }
    return defaults;
  });

  const [uiSettings, setUISettings] = useState<UISettings>(() => {
    const saved = localStorage.getItem('uiSettings');
    return saved ? JSON.parse(saved) : {
      showButtonBacklight: true,
      showFullName: false,
      showProfileNameInSidebar: true,
      developerShowButtonBacklight: true,
    };
  });

  const [journal, setJournal] = useState<DailyJournalEntry[]>(() => {
    const savedJournal = localStorage.getItem('aiJournal');
    return savedJournal ? JSON.parse(savedJournal) : [];
  });

  const [isQuestionChat, setIsQuestionChat] = useState(false);
  const [isImageChat, setIsImageChat] = useState(false);
  const [betaEnded, setBetaEnded] = useState(() => getBetaTestEnded());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { syncData, loadData } = useDataSync(userProfile?.buid); 

  useEffect(() => {
    if (userProfile?.buid) {
      loadData().then((syncedData: SyncedData | null) => {
        if (syncedData) {
          if (syncedData.chats) setChats(syncedData.chats);
          if (syncedData.userProfile) setUserProfile(syncedData.userProfile);
          if (syncedData.theme) setTheme(syncedData.theme);
          if (syncedData.splashGif) setSplashGif(syncedData.splashGif);
          if (syncedData.sidebarSettings) setSidebarSettings(syncedData.sidebarSettings);
          if (syncedData.aiJournal) setJournal(syncedData.aiJournal);
          if (syncedData.aiSettings) {
            setAISettings(prevAISettings => ({
              ...prevAISettings,
              ...syncedData.aiSettings,
              discussedTopics: syncedData.aiSettings?.discussedTopics || prevAISettings.discussedTopics || []
            }));
          }
          if (syncedData.uiSettings) {
            setUISettings(syncedData.uiSettings);
          }
        }
      });
    } else {
      const localChats = localStorage.getItem('chats');
      if (localChats) setChats(JSON.parse(localChats));
      
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
    }
  }, [userProfile?.buid, loadData]);

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

  useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('theme', theme); document.documentElement.className = theme; }, [theme]);
  useEffect(() => { localStorage.setItem('splashGif', splashGif); }, [splashGif]);
  useEffect(() => { 
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
    else localStorage.removeItem('userProfile');
  }, [userProfile]);
  useEffect(() => { localStorage.setItem('sidebarSettings', JSON.stringify(sidebarSettings)); }, [sidebarSettings]);
  useEffect(() => { localStorage.setItem('aiSettings', JSON.stringify(aiSettings)); }, [aiSettings]);
  useEffect(() => { localStorage.setItem('uiSettings', JSON.stringify(uiSettings)); 
    if (uiSettings.developerShowButtonBacklight) {
      document.documentElement.classList.add('button-backlight-enabled');
    } else {
      document.documentElement.classList.remove('button-backlight-enabled');
    }
  }, [uiSettings]);
  useEffect(() => { localStorage.setItem('aiJournal', JSON.stringify(journal)); }, [journal]);

  useEffect(() => {
    const isTwilightEnabled = localStorage.getItem('devTwilightTheme') === 'true';
    document.documentElement.classList.toggle('twilight', isTwilightEnabled);
  }, []);

  const addJournalLog = useCallback((type: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return;
    setJournal(prevJournal => {
      const today = new Date();
      const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const newLog: JournalLogItem = {
        timestamp: Date.now(),
        type,
        content 
      };

      const existingEntryIndex = prevJournal.findIndex(entry => entry.date === todayDateString);
      if (existingEntryIndex > -1) {
        const updatedJournal = [...prevJournal];
        const updatedEntry = {
          ...updatedJournal[existingEntryIndex],
          logs: [...updatedJournal[existingEntryIndex].logs, newLog]
        };
        updatedJournal[existingEntryIndex] = updatedEntry;
        return updatedJournal;
      } else {
        const newDailyEntry: DailyJournalEntry = { date: todayDateString, logs: [newLog] };
        return [...prevJournal, newDailyEntry];
      }
    });
  }, []);

  const handleCreateChat = () => { 
    const newChat: Chat = { id: nanoid(), title: 'New Chat', messages: [] };
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat.id);
    setShowSidebar(false);
    setIsQuestionChat(false);
    setIsImageChat(false);
  };
  const handleDeleteChat = (id: string) => { 
    const newChats = chats.filter(chat => chat.id !== id);
    setChats(newChats);
    if (activeChat === id) setActiveChat(newChats[0]?.id || '');
  };
  const handleRenameChat = (id: string, newTitle: string) => { 
    setChats(prev => prev.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat));
  };
  const handleUpdateChat = (updatedChat: Chat) => { 
    setChats(prev => prev.map(chat => chat.id === updatedChat.id ? updatedChat : chat));
  };
  const handleSelectChat = (id: string) => { 
    setActiveChat(id);
    setShowSidebar(false);
    setIsQuestionChat(false);
    setIsImageChat(false);
  };

  const handleUpdateAISettings = useCallback((updates: Partial<AISettings> | ((prevState: AISettings) => AISettings)) => {
    setAISettings(prev => {
        const newSettings = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
        newSettings.discussedTopics = newSettings.discussedTopics || [];
        return newSettings;
    });
  }, []);

  const handleUpdateUISettings = useCallback((updates: Partial<UISettings> | ((prevState: UISettings) => UISettings)) => {
    setUISettings(prev => {
        const newSettings = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
        return newSettings;
    });
  }, []);

  const handleUpdateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      const baseProfile = prevProfile || { 
        buid: nanoid(), nickname: 'Guest', email: '', isProfileComplete: false, interests: [], birthDate: '', lastUpdated: Date.now() 
      };
      const updatedProfile = { ...baseProfile, ...updates, lastUpdated: Date.now() };
      if (!prevProfile?.isProfileComplete && updatedProfile.nickname !== 'Guest' && updatedProfile.email && updatedProfile.birthDate) {
        updatedProfile.isProfileComplete = true;
      }
      if (updates.interests) {
        const oldInterests = prevProfile?.interests || [];
        const newInterestsAdded = updates.interests.filter(
          interest => !oldInterests.some(oi => oi.toLowerCase() === interest.toLowerCase())
        );
        if (newInterestsAdded.length > 0) {
          handleUpdateAISettings(prevAISettings => {
            const currentDiscussedTopics = prevAISettings.discussedTopics || [];
            const topicsToSyncToAISettings = newInterestsAdded.filter(
              interest => !currentDiscussedTopics.some(dt => dt.topic.toLowerCase() === interest.toLowerCase())
            );
            if (topicsToSyncToAISettings.length > 0) {
              return {
                ...prevAISettings,
                discussedTopics: [
                  ...currentDiscussedTopics,
                  ...topicsToSyncToAISettings.map(topic => ({ topic, discussed: false, lastDiscussedTimestamp: Date.now() }))
                ]
              };
            }
            return prevAISettings;
          });
        }
      }
      return updatedProfile;
    });
  }, [handleUpdateAISettings]);

  const handleToggleQuestionChat = () => { 
    setIsQuestionChat(prev => !prev);
    setIsImageChat(false);
    if (!isQuestionChat) setActiveChat('');
  };
  const handleToggleImageChat = (imageData?: string) => { 
    const targetIsImageChatState = !isImageChat;
    setIsImageChat(targetIsImageChatState);
    setIsQuestionChat(false);
    if (targetIsImageChatState) {
      setActiveChat(''); 
      if (imageData) {
        const newChat: Chat = {
          id: nanoid(), title: 'Image Generation', messages: [{
            role: 'user', content: 'Image to discuss or start with:', 
            images: [imageData], timestamp: Date.now()
          }]
        };
        setChats(prevChats => [...prevChats, newChat]);
        setActiveChat(newChat.id);
      }
    } else { 
      const firstRegularChat = chats.find(c => c.id !== activeChat || !isImageChat);
      setActiveChat(firstRegularChat?.id || '');
    }
  };
  const handleSaveChat = (title: string, messages: Message[]) => { 
    const newChat: Chat = { id: nanoid(), title, messages };
    setChats(prev => [...prev, newChat]);
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
      const dataToSync: SyncedData = {
        chats: JSON.parse(localStorage.getItem('chats') || '[]'),
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
  }, [userProfile?.buid, syncData]);

  const currentChat = chats.find(chat => chat.id === activeChat);

  if (betaEnded) return <BetaEndedScreen />;

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SplashScreen splashGif={splashGif} />
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
            chats={chats}
            activeChat={activeChat}
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
          <QuestionChat onSaveChat={handleSaveChat} isQuestionChat={isQuestionChat}/>
        ) : isImageChat ? (
          <ImageChat onSaveChat={handleSaveChat} />
        ) : currentChat ? (
          <ChatWindow
            chat={currentChat}
            onUpdateChat={handleUpdateChat}
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
                 {chats.length > 0 ? "Sohbet seçin veya yeni bir tane oluşturun." : "Henüz sohbet yok"}
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