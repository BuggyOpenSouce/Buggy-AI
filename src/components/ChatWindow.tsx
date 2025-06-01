// src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { Search, X, Loader2 } from 'lucide-react'; // Loader2 eklendi
import type { Message, UserProfile, AISettings, DailyJournalEntry, SyncedData, Theme, Chat } from '../types';
import { makeAPIRequest } from '../utils/api';
import { updateProfileFromMessage } from '../utils/profileUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  chat: Chat; // Tekrar Chat objesi alacak, App.tsx'de activeChatDetail olarak yönetiliyor.
  onUpdateChat: (updatedMessages: Message[]) => void; // Sadece mesajları güncelleyecek
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  isOffline: boolean;
  aiSettings: AISettings;
  addJournalLog: (type: 'user' | 'assistant', content: string) => void;
  journal: DailyJournalEntry[];
  syncData?: (data: SyncedData) => Promise<void>; // Bu prop App.tsx'den geliyor
  isLoadingContent?: boolean; // Bu prop eklendi
}

export function ChatWindow({
  chat,
  onUpdateChat, // Artık onUpdateMessages yerine onUpdateChat (App.tsx'deki adı handleUpdateActiveChatMessages olacak)
  userProfile,
  onUpdateProfile,
  isOffline,
  aiSettings,
  addJournalLog,
  journal,
  syncData, // Bu prop App.tsx'den gelecek
  isLoadingContent // Yeni prop
}: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false); // Mesaj gönderme sırasındaki yükleme
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatInputContainerRef = useRef<HTMLDivElement>(null); // ChatInput'u saran div için ref
  const [chatInputHeight, setChatInputHeight] = useState(90);

  useEffect(() => {
    const inputContainer = chatInputContainerRef.current;
    if (inputContainer) {
      const resizeObserver = new ResizeObserver(() => {
        setChatInputHeight(inputContainer.offsetHeight);
      });
      resizeObserver.observe(inputContainer);
      setChatInputHeight(inputContainer.offsetHeight); // İlk yükseklik ayarı
      return () => resizeObserver.disconnect();
    }
  }, []);


  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    // Gecikmeyi artırarak DOM güncellemelerinin tamamlanmasına izin ver
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100); // Daha uzun bir gecikme deneyin
  }, []);

  useEffect(() => {
    scrollToBottom('auto'); // Sohbet değiştiğinde anında en alta git
  }, [chat.id, scrollToBottom]);

  useEffect(() => {
    if (chat.messages.length > 0) {
        // Sadece son mesaj eklendiğinde smooth scroll yap
        const lastMessageTime = chat.messages[chat.messages.length - 1]?.timestamp;
        if (lastMessageTime && (Date.now() - lastMessageTime < 500)) { // Son mesaj 500ms içinde eklendiyse
             scrollToBottom('smooth');
        } else {
             scrollToBottom('auto'); // Diğer durumlarda (örn: ilk yükleme, arama) anında scroll
        }
    }
  }, [chat.messages, scrollToBottom]);


  const handleSendMessage = async (content: string, images?: string[]) => {
    if (isLoading || (!content.trim() && (!images || images.length === 0))) return;

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      images: images && images.length > 0 ? images : undefined,
      timestamp: Date.now()
    };

    if (userMessage.content) {
      addJournalLog('user', userMessage.content);
    }

    const updatedMessagesWithUser = [...chat.messages, userMessage];
    onUpdateChat(updatedMessagesWithUser); // App.tsx'e sadece güncellenmiş mesajları gönder
    setIsLoading(true);

    try {
      if (content.trim() && userProfile) {
        const profileUpdates = updateProfileFromMessage(content, userProfile);
        if (profileUpdates) {
          onUpdateProfile(profileUpdates);
        }
      }

      const response = await makeAPIRequest(updatedMessagesWithUser, userProfile, aiSettings, journal);
      
      let currentMessages = [...updatedMessagesWithUser];
      if (response?.choices?.[0]?.message?.content) {
        const assistantContent = response.choices[0].message.content;
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent.trim(),
          timestamp: Date.now()
        };
        currentMessages = [...currentMessages, assistantMessage];
        onUpdateChat(currentMessages); // App.tsx'e güncel mesajları bildir
        
        if (assistantMessage.content) {
          addJournalLog('assistant', assistantMessage.content);
        }
        // SyncData App.tsx'deki onUpdateChat (yani handleUpdateActiveChatMessages) içinde çağrılacak
      } else {
        const errorResponseMessage: Message = {
          role: 'assistant',
          content: "Yapay zekadan geçerli bir yanıt alınamadı.",
          timestamp: Date.now(),
        };
        currentMessages = [...currentMessages, errorResponseMessage];
        onUpdateChat(currentMessages);
        if (errorResponseMessage.content) {
          addJournalLog('assistant', errorResponseMessage.content);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Mesaj gönderilirken bir hata oluştu.";
      const errorMessage: Message = {
        role: 'assistant',
        content: errorMessageContent,
        timestamp: Date.now(),
      };
      onUpdateChat([...updatedMessagesWithUser, errorMessage]);
      if (errorMessage.content) {
        addJournalLog('assistant', errorMessage.content);
      }
    } finally {
      setIsLoading(false);
      // scrollToBottom çağrısı messages dependency'li useEffect içinde zaten var.
    }
  };
  
  const handleRegenerate = async (index: number) => {
    const messagesForRegeneration = chat.messages.slice(0, index);
    if (messagesForRegeneration.length === 0 || isLoading) return;

    setIsLoading(true);
    onUpdateChat(messagesForRegeneration); // Sadece regen yapılacak kısmı gönder

    try {
      const response = await makeAPIRequest(messagesForRegeneration, userProfile, aiSettings, journal);
      let currentMessages = [...messagesForRegeneration];
      if (response?.choices?.[0]?.message?.content) {
        const assistantContent = response.choices[0].message.content;
        const assistantMessage: Message = { role: 'assistant', content: assistantContent.trim(), timestamp: Date.now() };
        currentMessages.push(assistantMessage);
        onUpdateChat(currentMessages);
        if (assistantMessage.content) addJournalLog('assistant', `(Yeniden oluşturuldu) ${assistantMessage.content}`);
      } else {
        const errorResponseMessage: Message = { role: 'assistant', content: "Yanıt yeniden oluşturulamadı.", timestamp: Date.now() };
        currentMessages.push(errorResponseMessage);
        onUpdateChat(currentMessages);
        if (errorResponseMessage.content) addJournalLog('assistant', `(Yeniden oluşturma hatası) ${errorResponseMessage.content}`);
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Yeniden oluşturma sırasında bir hata oluştu.";
      const errorMessage: Message = { role: 'assistant', content: errorMessageContent, timestamp: Date.now() };
      onUpdateChat([...messagesForRegeneration, errorMessage]);
      if (errorMessage.content) addJournalLog('assistant', `(Yeniden oluşturma hatası) ${errorMessage.content}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExplain = async (index: number) => {
    const messageToExplain = chat.messages[index];
    if (!messageToExplain || messageToExplain.role !== 'assistant' || isLoading) return;

    const contextMessages = chat.messages.slice(0, index + 1);
    const explanationRequestContent = `"${messageToExplain.content}" bu mesajı daha detaylı açıklar mısın?`;
    const explanationRequestMessage: Message = { role: 'user', content: explanationRequestContent, timestamp: Date.now() };
    
    addJournalLog('user', explanationRequestContent);

    setIsLoading(true);
    // Önceki mesajları ve açıklama isteğini içeren yeni bir mesaj listesi oluştur
    const messagesWithNewRequest = [...chat.messages, explanationRequestMessage];
    onUpdateChat(messagesWithNewRequest); // Bu, App.tsx'e tüm mesajları gönderir, App.tsx bunu yönetir

    try {
      const response = await makeAPIRequest([...contextMessages, explanationRequestMessage], userProfile, aiSettings, journal);
      let currentMessagesAfterExplain = [...messagesWithNewRequest]; // Açıklama isteği dahil

      if (response?.choices?.[0]?.message?.content) {
        const explanationContent = response.choices[0].message.content;
        const explanationResponseMessage: Message = { role: 'assistant', content: explanationContent.trim(), timestamp: Date.now() };
        currentMessagesAfterExplain = [...currentMessagesAfterExplain, explanationResponseMessage]; // API yanıtını ekle
        onUpdateChat(currentMessagesAfterExplain);
        if (explanationResponseMessage.content) addJournalLog('assistant', `(Açıklama) ${explanationResponseMessage.content}`);
      } else {
         const errorResponseMessage: Message = { role: 'assistant', content: "Açıklama alınamadı.", timestamp: Date.now() };
        currentMessagesAfterExplain = [...currentMessagesAfterExplain, errorResponseMessage];
        onUpdateChat(currentMessagesAfterExplain);
        if (errorResponseMessage.content) addJournalLog('assistant', `(Açıklama hatası) ${errorResponseMessage.content}`);
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
       const errorMessageContent = error instanceof Error ? error.message : "Açıklama getirilirken bir hata oluştu.";
       const errorMessage: Message = { role: 'assistant', content: errorMessageContent, timestamp: Date.now() };
       const finalMessagesWithError = [...messagesWithNewRequest, errorMessage];
      onUpdateChat(finalMessagesWithError);
      if (errorMessage.content) addJournalLog('assistant', `(Açıklama hatası) ${errorMessage.content}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (!showSearch) { 
      setTimeout(() => searchInputRef.current?.focus(), 100); 
    } else { 
       setSearchTerm('');
    }
  };

  const filteredMessages = searchTerm
    ? chat.messages.filter(message =>
        (message.content?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      )
    : chat.messages;

  if (isLoadingContent) { // Yeni prop kontrolü
    return (
      <div className="flex-1 flex flex-col h-full items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Sohbet yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 p-2 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-md">
        <button
          onClick={toggleSearch}
          className="p-2 rounded-lg bg-transparent hover:bg-gray-500/10 dark:hover:bg-gray-400/10 transition-colors"
          aria-label={showSearch ? "Aramayı Gizle" : "Mesajlarda Ara"}
        >
          <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: '200px', opacity: 1, x: 0 }} 
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative"
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                 <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Aramayı Temizle"
                >
                   <X size={16}/>
                 </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div 
        className="flex-1 overflow-y-auto messages-container" // Bu class'ı CSS'de hedefleyeceğiz
        style={{ paddingBottom: `${chatInputHeight + 16}px`, paddingTop: '70px' }}
      > 
        <ChatMessages
          messages={filteredMessages}
          onRegenerate={handleRegenerate}
          onExplain={handleExplain}
          isLoading={isLoading && chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.role === 'user'}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div ref={chatInputContainerRef}> {/* ChatInput'u saran div */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isOffline={isOffline}
        />
      </div>
    </div>
  );
}