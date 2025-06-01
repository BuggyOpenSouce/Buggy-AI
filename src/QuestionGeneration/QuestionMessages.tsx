import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import type { Topic, Message } from './types';
import { makeAPIRequest } from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuestionMessagesProps {
  topics: Topic[];
  isFullscreen: boolean;
  messages: Message[];
  isLoading: boolean;
}

export function QuestionMessages({ topics, isFullscreen, messages, isLoading }: QuestionMessagesProps) {
  const [expandedAnswers, setExpandedAnswers] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerateAnswer = async (questionId: string, question: string) => {
    if (expandedAnswers.includes(questionId)) {
      setExpandedAnswers(prev => prev.filter(id => id !== questionId));
      return;
    }

    try {
      if (!answers[questionId]) {
        const response = await makeAPIRequest([
          { role: 'user', content: `Bu soruyu cevapla: ${question}` }
        ]);

        if (response?.choices?.[0]?.message?.content) {
          const answer = response.choices[0].message.content;
          setAnswers(prev => ({ ...prev, [questionId]: answer }));
        }
      }
      
      setExpandedAnswers(prev => [...prev, questionId]);
    } catch (error) {
      console.error('Error generating answer:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let position = 0;
      while (position < imgHeight) {
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          -position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        position += 297; // A4 height in mm
        if (position < imgHeight) pdf.addPage();
      }

      pdf.save('sorular.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getTextStyles = (text: string) => {
    return text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_|~~.*?~~|\^\^.*?\^\^)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      } else if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={index}>{part.slice(2, -2)}</u>;
      } else if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      } else if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={index}>{part.slice(2, -2)}</del>;
      } else if (part.startsWith('^^') && part.endsWith('^^')) {
        return <span key={index} className="tracking-widest">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };
  
  return (
    <AnimatePresence>
      <motion.div
        layout
        className={`transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto' : ''
        }`}
      >
        {isFullscreen && (
          <button
            onClick={handleDownloadPDF}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>PDF olarak indir</span>
          </button>
        )}

        <div
          ref={containerRef}
          className="max-w-4xl mx-auto p-8 space-y-8"
        >
          {topics.map((topic, topicIndex) => (
            <div
              key={topic.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
                {topicIndex + 1}. {getTextStyles(topic.name)}
              </h2>
              
              <div className="space-y-6">
                {topic.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="space-y-4"
                  >
                    <div className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold">
                        {questionIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                          {getTextStyles(question.content)}
                        </p>
                        
                        <button
                          onClick={() => handleGenerateAnswer(question.id, question.content)}
                          className="mt-2 text-blue-500 hover:text-blue-600 transition-colors text-sm"
                        >
                          {expandedAnswers.includes(question.id) ? 'Cevabı Gizle' : 'Cevabı Göster'}
                        </button>

                        <AnimatePresence>
                          {expandedAnswers.includes(question.id) && answers[question.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <p className="text-gray-700 dark:text-gray-300">
                                {getTextStyles(answers[question.id])}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}