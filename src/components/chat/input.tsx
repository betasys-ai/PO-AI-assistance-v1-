import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, X, Upload } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import { cn } from '../../lib/utils';
import type { MediaContent } from '../../store/chat-store';

interface ChatInputProps {
  onSend: (media: MediaContent[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || media.length > 0) && !disabled) {
      const content: MediaContent[] = [
        ...media,
        ...(text.trim() ? [{ type: 'text', content: text.trim() }] : []),
      ];
      onSend(content);
      setText('');
      setMedia([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    
    return text;
  };

  const handleFiles = async (files: FileList) => {
    for (const file of files) {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfText = await extractTextFromPDF(arrayBuffer);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            setMedia((prev) => [
              ...prev,
              {
                type: 'pdf',
                content: result,
                mimeType: file.type,
                fileName: file.name,
                pdfText,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white p-4 dark:bg-gray-800">
      {media.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item, index) => (
            <div key={index} className="relative">
              {item.type === 'pdf' && (
                <div className="group relative">
                  <div className="flex h-24 items-center justify-center rounded-lg border bg-gray-50 p-3 shadow-sm transition-all hover:shadow-md">
                    <div className="text-center">
                      <FileText className="mx-auto mb-1 h-8 w-8 text-purple-500" />
                      <span className="block max-w-[120px] truncate text-sm text-gray-600">
                        {item.fileName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative flex items-end gap-2 rounded-lg border-2 bg-white p-2',
          isDragging ? 'border-purple-500' : 'border-gray-200'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept=".pdf"
          className="hidden"
          multiple
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          disabled={disabled}
        >
          <Upload className="h-5 w-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDragging ? 'Drop files here...' : 'Type a message or drop PDF files...'}
          rows={1}
          className="flex-1 resize-none bg-transparent p-2 focus:outline-none dark:text-white"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || (!text.trim() && media.length === 0)}
          className="rounded-lg bg-purple-600 p-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}