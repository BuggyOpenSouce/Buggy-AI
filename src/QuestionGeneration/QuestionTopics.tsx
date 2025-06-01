import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Topic } from './types';

interface QuestionTopicsProps {
  topics: Topic[];
  onAddTopic: (name: string, questionCount: number) => void;
  onClose: () => void;
}

export function QuestionTopics({ topics, onAddTopic, onClose }: QuestionTopicsProps) {
  const [newTopic, setNewTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(1);

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      onAddTopic(newTopic.trim(), questionCount);
      setNewTopic('');
      setQuestionCount(1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-24 left-4 right-4 md:left-1/4 md:right-1/4 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Konular
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Yeni konu ekle..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[80px] text-center">
                {questionCount} Soru
              </span>
              <button
                onClick={() => setQuestionCount(Math.min(10, questionCount + 1))}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleAddTopic}
              disabled={!newTopic.trim()}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Konu Ekle
            </button>
          </div>

          <div className="space-y-3 mt-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {topic.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {topic.questionCount} Soru
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}