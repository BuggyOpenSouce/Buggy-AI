// project/src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { Search, X } from 'lucide-react';
import type { Chat, Message, UserProfile, AISettings, DailyJournalEntry, SyncedData, Theme } from '../types';
import { makeAPIRequest } from '../utils/api';
import { updateProfileFromMessage } from '../utils/profileUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  chat: Chat;
  onUpdateChat: (chat: Chat) => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  isOffline: boolean;
  aiSettings: AISettings;
  addJournalLog: (type: 'user' | 'assistant', content: string) => void;
  journal: DailyJournalEntry[];
  syncData?: (data: SyncedData) => Promise<void>;
}

export function ChatWindow({
  chat,
  onUpdateChat,
  userProfile,
  onUpdateProfile,
  isOffline,
  aiSettings,
  addJournalLog,
  journal,
  syncData
}: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [chatInputHeight, setChatInputHeight] = useState(90); // Initial estimated height

  useEffect(() => {
    if (chatInputRef.current) {
      setChatInputHeight(chatInputRef.current.offsetHeight);
    }
  }, [chatInputRef.current?.offsetHeight]);


  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chat.id, chat.messages, scrollToBottom]);

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
    onUpdateChat({ ...chat, messages: updatedMessagesWithUser });
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
        onUpdateChat({ ...chat, messages: currentMessages });
        
        if (assistantMessage.content) {
          addJournalLog('assistant', assistantMessage.content);
        }

        if (syncData && userProfile?.buid) {
          const dataToSync: SyncedData = {
            chats: JSON.parse(localStorage.getItem('chats') || '[]'),
            userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'),
            theme: localStorage.getItem('theme') as Theme || undefined,
            splashGif: localStorage.getItem('splashGif') || undefined,
            sidebarSettings: JSON.parse(localStorage.getItem('sidebarSettings') || '{}'),
            uiSettings: JSON.parse(localStorage.getItem('uiSettings') || '{}'),
            aiSettings: JSON.parse(localStorage.getItem('aiSettings') || '{}'),
            aiJournal: JSON.parse(localStorage.getItem('aiJournal') || '[]')
          };
          await syncData(dataToSync);
        }
      } else {
        const errorResponseMessage: Message = {
          role: 'assistant',
          content: "Yapay zekadan geçerli bir yanıt alınamadı.",
          timestamp: Date.now(),
        };
        currentMessages = [...currentMessages, errorResponseMessage];
        onUpdateChat({ ...chat, messages: currentMessages });
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
      onUpdateChat({ ...chat, messages: [...updatedMessagesWithUser, errorMessage] });
      if (errorMessage.content) {
        addJournalLog('assistant', errorMessage.content);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = async (index: number) => {
    const messagesForRegeneration = chat.messages.slice(0, index);
    if (messagesForRegeneration.length === 0 || isLoading) return;

    setIsLoading(true);
    onUpdateChat({ ...chat, messages: messagesForRegeneration }); 

    try {
      const response = await makeAPIRequest(messagesForRegeneration, userProfile, aiSettings, journal);
      let currentMessages = [...messagesForRegeneration];
      if (response?.choices?.[0]?.message?.content) {
        const assistantContent = response.choices[0].message.content;
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent.trim(),
          timestamp: Date.now()
        };
        currentMessages.push(assistantMessage);
        onUpdateChat({ ...chat, messages: currentMessages });
        if (assistantMessage.content) {
            addJournalLog('assistant', `(Yeniden oluşturuldu) ${assistantMessage.content}`);
        }
      } else {
        const errorResponseMessage: Message = { role: 'assistant', content: "Yanıt yeniden oluşturulamadı.", timestamp: Date.now() };
        currentMessages.push(errorResponseMessage);
        onUpdateChat({ ...chat, messages: currentMessages });
         if (errorResponseMessage.content) {
            addJournalLog('assistant', `(Yeniden oluşturma hatası) ${errorResponseMessage.content}`);
        }
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Yeniden oluşturma sırasında bir hata oluştu.";
      const errorMessage: Message = { role: 'assistant', content: errorMessageContent, timestamp: Date.now() };
      onUpdateChat({ ...chat, messages: [...messagesForRegeneration, errorMessage] });
      if (errorMessage.content) {
        addJournalLog('assistant', `(Yeniden oluşturma hatası) ${errorMessage.content}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExplain = async (index: number) => {
    const messageToExplain = chat.messages[index];
    if (!messageToExplain || messageToExplain.role !== 'assistant' || isLoading) return;

    const contextMessages = chat.messages.slice(0, index + 1);
    const explanationRequestContent = `"${messageToExplain.content}" bu mesajı daha detaylı açıklar mısın?`;
    const explanationRequestMessage: Message = {
      role: 'user',
      content: explanationRequestContent,
      timestamp: Date.now()
    };
    
    addJournalLog('user', explanationRequestContent);

    setIsLoading(true);
    let messagesWithExplanationRequest = [...chat.messages, explanationRequestMessage];
    onUpdateChat({ ...chat, messages: messagesWithExplanationRequest });

    try {
      const response = await makeAPIRequest([...contextMessages, explanationRequestMessage], userProfile, aiSettings, journal);
      let currentMessages = [...messagesWithExplanationRequest];

      if (response?.choices?.[0]?.message?.content) {
        const explanationContent = response.choices[0].message.content;
        const explanationResponseMessage: Message = { role: 'assistant', content: explanationContent.trim(), timestamp: Date.now() };
        currentMessages.push(explanationResponseMessage);
        onUpdateChat({ ...chat, messages: currentMessages});
        if (explanationResponseMessage.content) {
            addJournalLog('assistant', `(Açıklama) ${explanationResponseMessage.content}`);
        }
      } else {
         const errorResponseMessage: Message = { role: 'assistant', content: "Açıklama alınamadı.", timestamp: Date.now() };
        currentMessages.push(errorResponseMessage);
        onUpdateChat({ ...chat, messages: currentMessages });
        if (errorResponseMessage.content) {
            addJournalLog('assistant', `(Açıklama hatası) ${errorResponseMessage.content}`);
        }
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
       const errorMessageContent = error instanceof Error ? error.message : "Açıklama getirilirken bir hata oluştu.";
       const errorMessage: Message = { role: 'assistant', content: errorMessageContent, timestamp: Date.now() };
      onUpdateChat({ ...chat, messages: [...messagesWithExplanationRequest, errorMessage] });
      if (errorMessage.content) {
        addJournalLog('assistant', `(Açıklama hatası) ${errorMessage.content}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (!showSearch && !prev) { 
      setTimeout(() => searchInputRef.current?.focus(), 100); 
    } else if (showSearch && !prev) { 
       setSearchTerm('');
    }
  };

  const filteredMessages = searchTerm
    ? chat.messages.filter(message =>
        (message.content?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      )
    : chat.messages;

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
        className="flex-1 overflow-y-auto messages-container"
        style={{ paddingBottom: `${chatInputHeight + 16}px`, paddingTop: '70px' }} // Dynamic paddingBottom + paddingTop for floating search
      > 
        <ChatMessages
          messages={filteredMessages}
          onRegenerate={handleRegenerate}
          onExplain={handleExplain}
          isLoading={isLoading && chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.role === 'user'}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div ref={chatInputRef}> {/* Added ref to ChatInput wrapper */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isOffline={isOffline}
        />
      </div>
    </div>
  );
}