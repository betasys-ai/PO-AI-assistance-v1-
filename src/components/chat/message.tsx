import React, { forwardRef } from 'react';
import { Bot, User, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PDFViewer } from './pdf-viewer';
import type { Message, MediaContent } from '../../store/chat-store';

interface ChatMessageProps {
  message: Message;
  id?: string;
  tabIndex?: number;
  onActionClick?: (action: string) => void;
}

interface MediaRendererProps {
  media: MediaContent;
  onActionClick?: (action: string) => void;
}

function MediaRenderer({ media, onActionClick }: MediaRendererProps) {
  switch (media.type) {
    case 'pdf':
      return (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PDFViewer
            url={media.content}
            fileName={media.fileName || 'Document.pdf'}
            className="w-full"
          />
          {media.pdfText && (
            <div className="flex h-[400px] flex-col rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                Extracted Text
              </h3>
              <div className="flex-1 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {media.pdfText}
                </pre>
              </div>
            </div>
          )}
        </div>
      );
    case 'text':
    default:
      return <MessageContent content={media.content} onActionClick={onActionClick} />;
  }
}

interface MessageContentProps {
  content: string;
  onActionClick?: (action: string) => void;
}

function MessageContent({ content, onActionClick }: MessageContentProps) {
  // Regular expression to match numbered actions (e.g., "1. Action description")
  const actionPattern = /^(\d+\.\s+)(.+)$/gm;
  const parts = [];
  let lastIndex = 0;
  let match;
  let hasActions = false;

  while ((match = actionPattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add the action
    parts.push({
      type: 'action',
      number: match[1],
      content: match[2],
    });
    hasActions = true;

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {part.content.trim()}
            </div>
          );
        }
        return null;
      })}
      
      {hasActions && (
        <div className="mt-2 flex flex-wrap gap-2">
          {parts.map((part, index) => {
            if (part.type === 'action') {
              return (
                <button
                  key={index}
                  onClick={() => onActionClick?.(part.content)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-300/20 transition-all hover:bg-purple-100 hover:ring-purple-300 active:scale-95 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-800/40 dark:hover:bg-purple-900/50 dark:hover:ring-purple-700"
                >
                  <span className="text-purple-500/70 dark:text-purple-400/70">{part.number}</span>
                  {part.content}
                  <ArrowRight className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                </button>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, id, tabIndex, onActionClick }, ref) => {
    const isUser = message.role === 'user';

    return (
      <div
        ref={ref}
        id={id}
        tabIndex={tabIndex}
        className={cn(
          'focus:ring-purple-500/40 flex w-full items-start gap-3 rounded-lg p-3 transition-colors focus:outline-none focus:ring-2',
          isUser ? 'flex-row-reverse bg-white' : 'bg-gray-50',
          'dark:bg-gray-800 dark:text-white'
        )}
      >
        <div
          className={cn(
            'flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md border shadow-sm',
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white'
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {isUser ? 'You' : 'AI Assistant'}
          </p>
          <div className="prose prose-sm dark:prose-invert">
            {message.content.map((media, index) => (
              <div key={index} className="space-y-1">
                <MediaRenderer media={media} onActionClick={onActionClick} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);