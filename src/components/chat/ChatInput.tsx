// project/src/components/chat/ChatInput.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import Compressor from 'compressorjs';
import '../../styles/buttons.css';

interface ChatInputProps {
  onSendMessage: (content: string, images?: string[]) => void;
  isLoading: boolean;
  isOffline: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isOffline }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_IMAGE_SIZE_MB = 5;

  const handleSend = useCallback(() => {
    if ((!input.trim() && images.length === 0) || isLoading || isOffline) {
      return;
    }
    onSendMessage(input, images);
    setInput('');
    setImages([]);
    setImageFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Ensure scrollHeight is calculated correctly for height adjustment
      let scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight < 45 ? 45 : scrollHeight}px`;
      if(scrollHeight <= 45) textareaRef.current.style.height = '45px';

    }
  }, [input, images, isLoading, isOffline, onSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      alert(`En fazla ${MAX_IMAGES} resim yükleyebilirsiniz.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newBase64Images: string[] = [];
    const newImageFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} adlı dosya çok büyük (${MAX_IMAGE_SIZE_MB}MB limit).`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} geçerli bir resim dosyası değil.`);
        continue;
      }

      try {
        const compressedFile = await new Promise<Blob>((resolve, reject) => {
          new Compressor(file, {
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
            mimeType: 'image/jpeg',
            success: resolve,
            error: reject,
          });
        });

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => reader.result ? resolve(reader.result as string) : reject(new Error("FileReader result is null"));
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
        newBase64Images.push(base64);
        newImageFiles.push(file);
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        alert(`${file.name} işlenirken bir hata oluştu.`);
      }
    }

    if (newBase64Images.length > 0) {
      setImages(prev => [...prev, ...newBase64Images]);
      setImageFiles(prev => [...prev, ...newImageFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight < 45 ? 45 : scrollHeight}px`;
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = '45px'; // Initial and reset height
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight < 45 ? 45 : scrollHeight}px`;
    }
  }, [input]);


  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-white/20 dark:bg-black/10 backdrop-blur-lg shadow-lg">
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 px-1 sm:px-0">
          {images.map((imgSrc, index) => (
            <div key={index} className="relative flex-shrink-0 w-20 h-20 group">
              <img
                src={imgSrc}
                alt={`Yükleme ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-300/70 dark:border-gray-600/70"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Resim ${index + 1}'i kaldır`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || images.length >= MAX_IMAGES || isOffline}
          className="p-3 rounded-xl bg-white/30 dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end mb-[1px]"
          aria-label="Resim Ekle"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="chat-file-input"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder={isOffline ? "Çevrimdışısınız" : "Mesajınızı yazın..."}
          disabled={isOffline || isLoading}
          className="flex-1 min-h-[45px] max-h-[150px] pl-4 pr-4 py-2.5 
                     bg-white/50 dark:bg-gray-800/40 
                     text-black dark:text-white 
                     border border-white/40 dark:border-gray-500/50 
                     rounded-xl focus:outline-none 
                     focus:border-indigo-500/70 dark:focus:border-indigo-400/70
                     focus:bg-white/70 dark:focus:bg-gray-800/60
                     transition-all duration-300 resize-none overflow-y-auto 
                     disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-700/70 dark:placeholder-gray-300/70"
          rows={1}
          style={{ scrollbarWidth: 'none' }}
        />
        
        <button
          onClick={handleSend}
          disabled={(!input.trim() && images.length === 0) || isLoading || isOffline}
          className="send-button self-end mb-[1px]"
          aria-label="Mesaj Gönder"
        >
          <Send className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </button>
      </div>
    </div>
  );
}