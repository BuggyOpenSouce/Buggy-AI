// project/src/components/DeveloperSettings.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { X, RotateCw, Settings as SettingsIcon, BrainCircuit, User, Edit2, Trash2, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { setBetaTestEnded } from '../betatoggle';
import type { AISettings, UISettings } from '../types';

interface DeveloperSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  aiSettings: AISettings;
  onUpdateAISettings: (settingsOrUpdater: Partial<AISettings> | ((prevState: AISettings) => AISettings)) => void;
  uiSettings: UISettings; // Added
  onUpdateUISettings: (settingsOrUpdater: Partial<UISettings> | ((prevState: UISettings) => UISettings)) => void; // Added
}

export function DeveloperSettings({ 
  isOpen, 
  onClose, 
  aiSettings, 
  onUpdateAISettings,
  uiSettings, // Use from props
  onUpdateUISettings // Use from props
}: DeveloperSettingsProps) {
  const [isTwilightEnabled, setIsTwilightEnabled] = useState(() => {
    return localStorage.getItem('devTwilightTheme') === 'true';
  });

  const [editableAISettings, setEditableAISettings] = useState<AISettings>(aiSettings);
  const [newPoint, setNewPoint] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    setEditableAISettings({
      ...aiSettings,
      importantPoints: aiSettings.importantPoints || [],
      discussedTopics: aiSettings.discussedTopics || [],
    });
  }, [aiSettings]);

  const handleSaveAISettings = useCallback(() => {
    onUpdateAISettings(editableAISettings);
  }, [editableAISettings, onUpdateAISettings]);


  const handleTwilightToggle = () => {
    const newTwilightState = !isTwilightEnabled;
    setIsTwilightEnabled(newTwilightState);
    localStorage.setItem('devTwilightTheme', newTwilightState.toString());
    window.location.reload();
  };

  const handleAddPoint = () => {
    if (newPoint.trim() && (editableAISettings.importantPoints?.length || 0) < 10) {
      setEditableAISettings(prev => ({
        ...prev,
        importantPoints: [...(prev.importantPoints || []), newPoint.trim()]
      }));
      setNewPoint('');
    }
  };

  const handleRemovePoint = (index: number) => {
    setEditableAISettings(prev => ({
      ...prev,
      importantPoints: (prev.importantPoints || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddDiscussedTopic = () => {
    if (newTopicName.trim()) {
      const currentTopics = editableAISettings.discussedTopics || [];
      if (!currentTopics.some(t => t.topic.toLowerCase() === newTopicName.trim().toLowerCase())) {
        setEditableAISettings(prev => ({
          ...prev,
          discussedTopics: [
            ...(prev.discussedTopics || []),
            { topic: newTopicName.trim(), discussed: false, lastDiscussedTimestamp: Date.now() }
          ]
        }));
      }
      setNewTopicName('');
    }
  };

  const handleRemoveDiscussedTopic = (topicNameToRemove: string) => {
    setEditableAISettings(prev => ({
      ...prev,
      discussedTopics: (prev.discussedTopics || []).filter(t => t.topic !== topicNameToRemove)
    }));
  };

  const handleToggleDiscussedStatus = (topicNameToToggle: string) => {
    setEditableAISettings(prev => ({
      ...prev,
      discussedTopics: (prev.discussedTopics || []).map(t =>
        t.topic === topicNameToToggle ? { ...t, discussed: !t.discussed, lastDiscussedTimestamp: Date.now() } : t
      )
    }));
  };
  
  const handleCompanyNameChange = (name: string) => {
    setEditableAISettings(prev => ({
      ...prev,
      companyName: name
    }));
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center overflow-y-auto p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full md:h-auto md:max-h-[90vh] md:w-[800px] bg-white dark:bg-gray-800 md:rounded-xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Geliştirici Ayarları</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><Edit2 className="w-5 h-5" /> Şirket Adı</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="text" value={editableAISettings.companyName || ''} onChange={(e) => handleCompanyNameChange(e.target.value)} placeholder="Şirket adını girin" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><User className="w-5 h-5" /> Arayüz Ayarları</h3>
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {[
                    {label: 'Buton Arka Aydınlatması (Geliştirici)', field: 'developerShowButtonBacklight', desc: 'Tüm butonlar için genel bir arka aydınlatma efekti ekler.'},
                    {label: 'Kenar Çubuğu Buton Arka Işığı', field: 'showButtonBacklight', desc: 'Kenar çubuğundaki butonlar için bir arka ışık efekti ekler.'},
                    {label: 'Tam Adı Göster', field: 'showFullName', desc: 'Kenar çubuğunda profil adlarını kısaltmadan tam olarak göster.'},
                    {label: 'Kenar Çubuğunda Profil Adını Göster', field: 'showProfileNameInSidebar', desc: 'Kenar çubuğunda "BuggyAI" yerine profil adını göster.'}
                ].map(setting => (
                    <div key={setting.field} className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">{setting.label}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={uiSettings[setting.field as keyof UISettings]} 
                                onChange={(e) => onUpdateUISettings(prev => ({ ...prev, [setting.field]: e.target.checked }))} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Beta Test Kontrolü</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <button onClick={() => { setBetaTestEnded(true); window.location.reload();}} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Beta Testini Sonlandır
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Tema Ayarları</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                 <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Alacakaranlık Teması</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alacakaranlık temasını etkinleştirir.</p>
                  </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isTwilightEnabled} onChange={handleTwilightToggle} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"><BrainCircuit className="w-5 h-5" /> BuggyAI Yapılandırmaları</h3>
              <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Maksimum Cevap Uzunluğu: {editableAISettings.maxTokens || 2048}</label>
                  <input type="range" min="128" max="45000" value={editableAISettings.maxTokens || 2048} onChange={(e) => setEditableAISettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sıcaklık: {(editableAISettings.temperature || 0.7).toFixed(2)}</label>
                  <input type="range" min="0.3" max="0.7" step="0.01" value={editableAISettings.temperature || 0.7} onChange={(e) => setEditableAISettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bağlamsal Farkındalık (Beta) ({(editableAISettings.importantPoints || []).length}/10)</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newPoint} onChange={(e) => setNewPoint(e.target.value)} placeholder="Önemli bir nokta ekle..." className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" disabled={(editableAISettings.importantPoints || []).length >= 10} />
                    <button onClick={handleAddPoint} disabled={!newPoint.trim() || (editableAISettings.importantPoints || []).length >= 10} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">Ekle</button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {(editableAISettings.importantPoints || []).map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-200">{point}</span>
                        <button onClick={() => handleRemovePoint(index)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tartışılan Konular ({(editableAISettings.discussedTopics || []).length})</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="Yeni konu adı" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"/>
                    <button onClick={handleAddDiscussedTopic} disabled={!newTopicName.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">Konu Ekle</button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {(editableAISettings.discussedTopics || []).map((topicItem) => (
                      <div key={topicItem.topic} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600/50 rounded-lg">
                        <span className={`text-sm ${topicItem.discussed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{topicItem.topic}</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleToggleDiscussedStatus(topicItem.topic)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                            {topicItem.discussed ? <CheckSquare className="w-4 h-4 text-green-500"/> : <Square className="w-4 h-4"/>}
                          </button>
                          <button onClick={() => handleRemoveDiscussedTopic(topicItem.topic)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveAISettings} className="w-full px-4 py-2 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Yapay Zeka Ayarlarını Kaydet
                </button>
              </div>
            </div>

            <button onClick={handleReload} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RotateCw className="w-5 h-5" /> BuggyEnviroment'ı Yeniden Başlat
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}