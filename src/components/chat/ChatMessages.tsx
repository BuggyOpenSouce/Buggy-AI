// project/src/components/chat/ChatMessages.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, RefreshCw, Info, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import type { Message } from '../../types';

interface ChatMessagesProps {
  messages: Message[];
  onRegenerate: (index: number) => void;
  onExplain: (index: number) => void;
  isLoading: boolean;
}

export function ChatMessages({ messages, onRegenerate, onExplain, isLoading }: ChatMessagesProps) {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // console.log('Kod kopyalandı!'); // İsteğe bağlı bildirim
    }).catch(err => {
      console.error('Kod kopyalanamadı:', err);
    });
  };

  const handleDownloadCode = (code: string, filenameFromAI: string | undefined) => {
    let filename = filenameFromAI || 'kod_parcasi.txt';
    // Dosya uzantısı yoksa veya tanımsızsa varsayılan .txt ekle
    if (!filename.includes('.')) {
        filename += '.txt';
    }

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMessageContent = (message: Message, index: number) => {
    return (
      <div className="message-content-wrapper">
        {message.images && message.images.length > 0 && (
          <div className="my-2 flex flex-wrap gap-2">
            {message.images.map((imgSrc, i) => (
              <motion.img
                key={`${index}-img-${i}`}
                src={imgSrc}
                alt={`Kullanıcı tarafından yüklenen resim ${i + 1}`}
                className="max-w-[200px] sm:max-w-[250px] h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                loading="lazy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        )}
        {message.content && (
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{
                pre: ({ children, ...props }) => {
                  // `children` genellikle tek bir `<code>` elementi içerir.
                  if (React.Children.count(children) === 1) {
                    const codeElement = React.Children.toArray(children)[0] as React.ReactElement;
                    if (codeElement.type === 'code' && codeElement.props) {
                      const { className, children: codeContentNode } = codeElement.props;
                      const language = (className || '').replace('language-', '');
                      
                      let codeString = '';
                      if (typeof codeContentNode === 'string') {
                        codeString = codeContentNode;
                      } else if (Array.isArray(codeContentNode)) {
                        codeString = codeContentNode.map(String).join('');
                      }
                      
                      codeString = codeString.trim();
                      let filenameFromAI: string | undefined = undefined;
                      let actualCode = codeString;

                      const firstLine = codeString.split('\n')[0];
                      const filenameMatch = firstLine.match(/^(?:#|\/\/) filename:\s*(.+)$/);
                      if (filenameMatch && filenameMatch[1]) {
                        filenameFromAI = filenameMatch[1].trim();
                        actualCode = codeString.substring(codeString.indexOf('\n') + 1).trimStart();
                      }

                      return (
                        <div className="code-block-container group">
                          <div className="code-block-header">
                            <span className="code-language">{language || 'kod'}</span>
                            <div className="code-actions">
                              <button
                                onClick={() => handleCopyCode(actualCode)}
                                className="code-action-button"
                                title="Kodu Kopyala"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => handleDownloadCode(actualCode, filenameFromAI)}
                                className="code-action-button"
                                title={`"${filenameFromAI || (language ? `snippet.${language}` : 'snippet.txt')}" olarak indir`}
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                          {/* Orijinal `pre` özelliklerini (props) buraya aktarıyoruz, ama stili CSS ile yöneteceğiz */}
                          <pre {...props}> 
                            <code>{actualCode}</code>
                          </pre>
                        </div>
                      );
                    }
                  }
                  // Varsayılan `pre` render'ı (başka bir durum için)
                  return <pre {...props} className="default-markdown-pre">{children}</pre>;
                },
                // Inline code için stil
                code({ node, className, children, ...props }) {
                    // Eğer pre elementi içinde değilsek (yani inline kod ise)
                    // pre elementi içindeki kodlar zaten yukarıdaki pre render'ı ile hallediliyor.
                    // Bu kontrol, `pre > code` için özel stillerin inline `code`'u etkilememesini sağlar.
                    const isInsidePre = node?.parent?.type === 'element' && node.parent.tagName === 'pre';
                    if (isInsidePre) {
                         // pre render'ı zaten içindeki code için kendi formatlamasını yapıyor.
                         // Bu yüzden burada sadece children'ı döndürmek yeterli olabilir
                         // ya da ReactMarkdown'ın kendi code render'ına bırakılabilir.
                         // Ancak custom pre render'ımız kendi <code> etiketini oluşturduğu için
                         // ReactMarkdown'ın bu code component'ini pre içinde çağırmaması beklenir.
                         // Güvenlik için, eğer bir şekilde çağrılırsa, basitçe içeriği döndür.
                        return <code {...props} className={className}>{children}</code>;
                    }
                    return (
                        <code {...props} className={`inline-code ${className || ''}`}>
                        {children}
                        </code>
                    );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  if (!messages || messages.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-lg">Henüz mesaj yok.</p>
            <p className="text-sm">Bir mesaj yazarak sohbete başlayın.</p>
        </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.timestamp}-${index}-${message.role}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`message-bubble group relative ${message.role === 'user' ? 'user' : 'assistant'}`}>
                {renderMessageContent(message, index)}
                {message.role === 'assistant' && !isLoading && index === messages.length -1 && (
                  <div className="message-actions absolute -bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => onRegenerate(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Yeniden Oluştur"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => onExplain(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Açıkla"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                )}
              </div>
               <span className="text-xs text-gray-400 dark:text-gray-500 px-2 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          
          {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && (
            <motion.div
              key="loading-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="message-bubble assistant">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div className="space-x-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}