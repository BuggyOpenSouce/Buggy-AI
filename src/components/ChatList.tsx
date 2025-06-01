import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, Edit2, Sparkles, Settings as SettingsIcon, Bot, ChevronLeft, BookOpen, Image, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chat, SidebarSettings, UserProfile, UISettings } from '../types'; // Added UISettings
import { Settings } from './Settings';
import { getCurrentProvider, setCurrentProvider } from '../utils/api';
import { AI_PROVIDERS } from '../config';

interface ChatListProps {
  chats: Chat[];
  activeChat: string;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  sidebarSettings?: SidebarSettings;
  theme: string;
  setTheme: (theme: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  onToggleQuestionChat: () => void;
  onToggleImageChat: () => void;
  isQuestionChat: boolean;
  isImageChat: boolean;
  onOpenDevSettings: () => void;
  onUpdateSidebarBackground: (url: string) => void;
  onUpdateSplashScreen: (url: string) => void;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  uiSettings: UISettings; // Added
}

export function ChatList({ 
  chats, 
  activeChat, 
  onSelectChat, 
  onCreateChat, 
  onDeleteChat,
  onRenameChat,
  sidebarSettings,
  theme,
  setTheme,
  showSettings,
  setShowSettings,
  onToggleQuestionChat,
  onToggleImageChat,
  isQuestionChat,
  isImageChat,
  onOpenDevSettings,
  onUpdateSidebarBackground,
  onUpdateSplashScreen,
  userProfile,
  onOpenProfile,
  uiSettings // Use from props
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim());
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  const handleCreateNewChat = (type: 'normal' | 'question' | 'image') => {
    setShowNewChatModal(false);
    if (type === 'question') {
      onToggleQuestionChat();
    } else if (type === 'image') {
      onToggleImageChat();
    } else {
      onCreateChat();
    }
  };

  const currentProvider = getCurrentProvider();

  // Use uiSettings from props
  const showButtonBacklight = uiSettings.showButtonBacklight ?? true;
  const showFullName = uiSettings.showFullName ?? false;
  const showProfileNameInSidebar = uiSettings.showProfileNameInSidebar ?? true;

  const truncateName = (name: string) => {
    if (showFullName || !name) return name; // Added !name check
    return name.length > 15 ? `${name.slice(0, 15)}...` : name;
  };

  const sidebarStyle = sidebarSettings?.backgroundImage ? {
    backgroundImage: `url(${sidebarSettings.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  } : {
    backgroundColor: theme === 'dark' ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  return (
    <div 
      className="w-80 h-[calc(100vh-2rem)] my-4 ml-4 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
      style={sidebarStyle}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {showProfileNameInSidebar && userProfile?.nickname
                  ? truncateName(userProfile.nickname)
                  : 'BuggyAI'
                }
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className={`p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors ${
                showButtonBacklight ? 'shadow-lg hover:shadow-xl' : ''
              }`}
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.nickname}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowAIMenu(!showAIMenu)}
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showAIMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {AI_PROVIDERS.map((_, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        await setCurrentProvider(index);
                        setShowAIMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${
                        currentProvider.index === index ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {`BuggyAI-${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Settings component is not rendered directly here, so no changes needed for it in ChatList directly */}
        <>
          <div className="px-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 mt-4 custom-scrollbar">
            <AnimatePresence>
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-102 mb-1 ${
                    activeChat === chat.id
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white'
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  {editingChatId === chat.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <MessageSquare className={`w-5 h-5 flex-shrink-0 ${
                          activeChat === chat.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'
                        }`} />
                        <span className="font-medium truncate">{chat.title || 'New Chat'}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(chat);
                          }}
                          className="p-1 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      </div>

      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-sm w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Chat
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleCreateNewChat('normal')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Normal Chat</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Start a regular conversation</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCreateNewChat('question')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Question Chat</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Generate and answer questions</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCreateNewChat('image')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Image className="w-6 h-6 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Image Chat</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Generate images from descriptions</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}