// project/src/components/Settings.tsx
import React, { useState, useRef } from 'react';
import {
  Sun, Moon, Upload, X, Save, Image as ImageIcon, Trash2, Search,
  Settings as SettingsIcon, Palette, Bell, Lock, Globe, Database,
  Monitor, Keyboard, Mouse, HelpCircle, Info, User, Brush
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Theme, SidebarSettings, UserProfile } from '../types';

interface SettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isOpen: boolean;
  onToggle: () => void;
  onSplashScreenChange: (url: string) => void;
  onSidebarBackgroundChange: (url: string) => void;
  sidebarSettings?: SidebarSettings;
  userProfile?: UserProfile | null;
  onManualSync: () => Promise<void>;
  isOffline: boolean;
  onOpenDevSettings?: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export function Settings({
  theme,
  setTheme,
  isOpen,
  onToggle,
  onSplashScreenChange,
  onSidebarBackgroundChange,
  sidebarSettings,
  userProfile,
  onManualSync,
  isOffline,
  onOpenDevSettings
}: SettingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string>('appearance');
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const sections: SettingsSection[] = [
    { id: 'appearance', title: 'Görünüm', icon: <Brush className="w-5 h-5" />, description: 'Tema ve görsel özelleştirmeler' },
    { id: 'profile', title: 'Profil', icon: <User className="w-5 h-5" />, description: 'Profil ayarları ve tercihler' },
    { id: 'notifications', title: 'Bildirimler', icon: <Bell className="w-5 h-5" />, description: 'Bildirim tercihleri' },
    { id: 'privacy', title: 'Gizlilik', icon: <Lock className="w-5 h-5" />, description: 'Gizlilik ve güvenlik ayarları' },
    { id: 'language', title: 'Dil', icon: <Globe className="w-5 h-5" />, description: 'Dil ve bölge ayarları' },
    { id: 'sync', title: 'Senkronizasyon', icon: <Database className="w-5 h-5" />, description: 'Veri senkronizasyonu' },
    { id: 'display', title: 'Ekran', icon: <Monitor className="w-5 h-5" />, description: 'Ekran ayarları' },
    { id: 'accessibility', title: 'Erişilebilirlik', icon: <HelpCircle className="w-5 h-5" />, description: 'Erişilebilirlik seçenekleri' },
    { id: 'about', title: 'Hakkında', icon: <Info className="w-5 h-5" />, description: 'Uygulama bilgileri' },
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackgroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onSidebarBackgroundChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSidebarBackground = () => {
    onSidebarBackgroundChange('');
  };

  const handleSplashFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onSplashScreenChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSplashScreen = () => {
    onSplashScreenChange('');
  };

  const handleTriggerManualSync = async () => {
    await onManualSync();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50"
      onClick={onToggle} // Close when clicking on backdrop
    >
      <motion.div
        className="h-full flex"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
      >
        {/* Sidebar */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-80 h-full bg-gray-100 dark:bg-gray-800 p-6 overflow-y-auto shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ayarlar</h1>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Ayarlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm opacity-80">{section.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
          className="flex-1 p-8 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-end mb-6">
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-8"
              >
                {activeSection === 'appearance' && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Görünüm</h2>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tema</h3>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              <span className="text-gray-600 dark:text-gray-300">Aydınlık</span>
                            </div>
                            <button
                              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                layout
                                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                                  theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <div className="flex items-center gap-2">
                              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              <span className="text-gray-600 dark:text-gray-300">Karanlık</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kenar Çubuğu Arka Planı</h3>
                          <div className="space-y-4">
                            {sidebarSettings?.backgroundImage && (
                              <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img
                                  src={sidebarSettings.backgroundImage}
                                  alt="Kenar Çubuğu Önizlemesi"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    onClick={handleResetSidebarBackground}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => backgroundInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <ImageIcon className="w-5 h-5" />
                              <span>Resim Seç</span>
                            </button>
                            <input
                              ref={backgroundInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleBackgroundFileChange}
                              className="hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Açılış Ekranı GIF</h3>
                          <div className="space-y-4">
                            <button
                              onClick={() => splashInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Upload className="w-5 h-5" />
                              <span>GIF Seç</span>
                            </button>
                            <input
                              ref={splashInputRef}
                              type="file"
                              accept="image/gif"
                              onChange={handleSplashFileChange}
                              className="hidden"
                            />
                            <button
                              onClick={handleResetSplashScreen}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span>GIF'i Sıfırla</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'sync' && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Senkronizasyon</h2>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Veri Senkronizasyonu</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Verilerinizi sunucu ile senkronize edin ve yedekleyin.
                          </p>
                          <button
                            onClick={handleTriggerManualSync}
                            disabled={!userProfile?.buid || isOffline}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-5 h-5" />
                            <span>Verileri Şimdi Senkronize Et</span>
                          </button>
                          {isOffline && (
                            <p className="text-sm text-red-500 dark:text-red-400 text-center">
                              Senkronizasyon için çevrimiçi olmalısınız.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                 {activeSection === 'about' && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Hakkında</h2>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Geliştirici Seçenekleri</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Gelişmiş ayarlar ve debug seçenekleri
                              </p>
                            </div>
                            <button
                              onClick={onOpenDevSettings}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              Aç
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* Placeholder for other sections */}
                {activeSection !== 'appearance' && activeSection !== 'sync' && activeSection !== 'about' && (
                     <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{sections.find(s=>s.id === activeSection)?.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400">Bu bölüm için içerik yakında eklenecektir.</p>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}