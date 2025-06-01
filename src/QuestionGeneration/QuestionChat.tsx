import React, { useState, useCallback, useMemo } from 'react';
import { Send, Plus, Maximize2, Minimize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionTopics } from './QuestionTopics';
import { QuestionMessages } from './QuestionMessages';
import type { Topic, Message } from './types';
import { nanoid } from 'nanoid';
import { makeAPIRequest } from '../utils/api';

interface QuestionChatProps {
  isQuestionChat?: boolean;
  onSaveChat?: (title: string, messages: Message[]) => void;
}

export function QuestionChat({ isQuestionChat, onSaveChat }: QuestionChatProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTopic = useCallback((name: string, questionCount: number) => {
    setTopics(prev => [...prev, {
      id: nanoid(),
      name,
      questionCount,
      questions: []
    }]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() && topics.length === 0) return;
    
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      const topicsPrompt = topics.map(topic => 
        `${topic.name} (${topic.questionCount} soru)`
      ).join(', ');

      const prompt = topics.length > 0
        ? `Lütfen şu konularda sorular oluştur: ${topicsPrompt}\n\nKullanıcı mesajı: ${message}`
        : message;

      const response = await makeAPIRequest([
        {
          role: 'system',
          content: 'Sen bir eğitim asistanısın. Kullanıcının istediği konularda sorular oluştur ve cevapla.'
        },
        { role: 'user', content: prompt }
      ]);

      if (response?.choices?.[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);

        const questionRegex = /(\d+)\.\s+(.+?)\s*(?:\nCevap:\s*(.+?))?(?=\n\d+\.|\n*$)/gs;
        let match;
        const newQuestions = [];

        while ((match = questionRegex.exec(response.choices[0].message.content)) !== null) {
          newQuestions.push({
            id: nanoid(),
            content: match[2].trim(),
            answer: match[3]?.trim() || '',
            drawings: []
          });
        }

        if (newQuestions.length > 0 && topics.length > 0) {
          setTopics(prevTopics => {
            const updatedTopics = [...prevTopics];
            const lastTopic = updatedTopics[updatedTopics.length - 1];
            lastTopic.questions = [...(lastTopic.questions || []), ...newQuestions];
            return updatedTopics;
          });

          if (onSaveChat) {
            const title = topics.map(t => t.name).join(', ');
            onSaveChat(title, [...messages, userMessage, assistantMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message, topics, messages, onSaveChat]);

  const messagesList = useMemo(() => (
    <QuestionMessages
      topics={topics}
      isFullscreen={isFullscreen}
      messages={messages}
      isLoading={isLoading}
    />
  ), [topics, isFullscreen, messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <AnimatePresence>
        {showTopics && (
          <QuestionTopics
            topics={topics}
            onAddTopic={handleAddTopic}
            onClose={() => setShowTopics(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-gray-800/50 hover:bg-gray-800/70 text-white rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        {messagesList}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <button
            onClick={() => setShowTopics(true)}
            className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            disabled={isLoading}
          />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!message.trim() && topics.length === 0)}
            className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}