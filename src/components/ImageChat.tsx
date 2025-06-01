import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { makeAPIRequest } from '../utils/api';
import { generateFastImage } from '../configMultiImager/fast';
import { getImageGenerationLimit, incrementImageCount } from '../utils/imageLimit';
import type { Message } from '../types';

interface ImageChatProps {
  onSaveChat?: (title: string, messages: Message[]) => void;
}

export function ImageChat({ onSaveChat }: ImageChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingImages, setRemainingImages] = useState(10);
  const [improvePrompts, setImprovePrompts] = useState(true);

  useEffect(() => {
    getImageGenerationLimit().then(setRemainingImages);
  }, []);

  const translateToEnglish = async (text: string): Promise<string> => {
    try {
      const response = await makeAPIRequest([{
        role: 'system',
        content: 'You are a translator. Translate the following text to English. Only respond with the translation, nothing else.'
      }, {
        role: 'user',
        content: text
      }]);

      return response?.choices?.[0]?.message?.content || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (remainingImages <= 0) {
      setError('You have reached your daily limit of 10 images. Please try again tomorrow.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const canGenerate = await incrementImageCount();
      if (!canGenerate) {
        throw new Error('Daily image generation limit reached');
      }

      // Translate non-English text to English
      const translatedPrompt = await translateToEnglish(input);
      
      let finalPrompt = translatedPrompt;
      if (improvePrompts) {
        // Improve the prompt using AI
        const response = await makeAPIRequest([{
          role: 'system',
          content: 'You are an expert at writing prompts for image generation AI. Improve the user\'s prompt to get better results. Keep the improved prompt concise and focused.'
        }, {
          role: 'user',
          content: `Improve this image generation prompt: ${translatedPrompt}`
        }]);

        if (response?.choices?.[0]?.message?.content) {
          finalPrompt = response.choices[0].message.content;
        }
      }
      
      // Generate image with final prompt
      const imageBlob = await generateFastImage(finalPrompt);
      
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        const aiMessage: Message = {
          role: 'assistant',
          content: base64data,
          timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMessage, aiMessage];
        setMessages(updatedMessages);

        if (onSaveChat) {
          onSaveChat('Image Chat: ' + input, updatedMessages);
        }
      };

      setRemainingImages(await getImageGenerationLimit());
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uiSettings = JSON.parse(localStorage.getItem('uiSettings') || '{}');
  const showButtonBacklight = uiSettings.showButtonBacklight ?? true;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white">
              <Zap className="w-5 h-5" />
              <span>Fast Generation</span>
            </button>
            <button
              onClick={() => setImprovePrompts(!improvePrompts)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                improvePrompts 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Improve Prompts</span>
            </button>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {remainingImages} images remaining today
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`message-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>
                  {message.content.startsWith('data:image/') ? (
                    <motion.img
                      src={message.content}
                      alt="Generated"
                      className="rounded-lg max-w-full"
                      loading="lazy"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin">
                      <ImageIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Generating your image...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-4">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the image you want to create..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`send-button ${showButtonBacklight ? 'button-backlight' : ''}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}