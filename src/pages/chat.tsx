import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../components/chat/message';
import { ChatInput } from '../components/chat/input';
import { TypingIndicator } from '../components/chat/typing-indicator';
import { ChatHeader } from '../components/chat/header';
import { useChatStore } from '../store/chat-store';
import { useConfigStore } from '../store/config-store';
import { getBedrockResponse } from '../lib/ai-providers/bedrock';
import { getOpenAIResponse } from '../lib/ai-providers/openai';
import { getGeminiResponse } from '../lib/ai-providers/gemini';
import { getLlamaResponse } from '../lib/ai-providers/llama';
import type { MediaContent } from '../store/chat-store';

const PO_PROMPTS = [
  "Convert this purchase order into a CSV format with columns: Item No, Description, Quantity, Unit Price, Total Amount",
  "Extract all line items from this PO and format them as a spreadsheet",
  "List all products and their quantities from this purchase order",
  "Calculate the total order value and provide a breakdown by item",
];

const MODEL_INFO = {
  'claude-v2': {
    name: 'Claude v2',
    description: 'Anthropic\'s advanced language model, excellent at structured data extraction and analysis.',
    provider: 'AWS Bedrock'
  },
  'gpt-4': {
    name: 'GPT-4',
    description: 'OpenAI\'s most capable model, with strong reasoning and instruction following abilities.',
    provider: 'OpenAI'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'OpenAI\'s efficient model balancing performance and speed.',
    provider: 'OpenAI'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    description: 'Google\'s advanced language model with strong analytical capabilities.',
    provider: 'Google'
  },
  'llama-2': {
    name: 'LLaMA 2',
    description: 'Open-source language model with competitive performance.',
    provider: 'Local/Custom'
  }
};

export function Chat() {
  const {
    messages,
    loading,
    theme,
    model,
    documentContext,
    addMessage,
    setLoading,
    clearMessages,
    setModel,
    toggleTheme,
    setDocumentContext,
  } = useChatStore();

  const { providers } = useConfigStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Auto-focus effect for new messages
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessageRef.current) {
        lastMessageRef.current.focus();
        lastMessageRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [messages, loading]);

  const handleModelChange = (newModel: typeof model) => {
    setModel(newModel);
    const modelDetails = MODEL_INFO[newModel];
    
    // Check if the selected model's provider is properly configured
    let configError = '';
    switch (newModel) {
      case 'claude-v2':
        if (!providers.bedrock.accessKeyId || !providers.bedrock.secretAccessKey) {
          configError = 'AWS Bedrock credentials are not configured.';
        }
        break;
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        if (!providers.openai.apiKey) {
          configError = 'OpenAI API key is not configured.';
        }
        break;
      case 'gemini-pro':
        if (!providers.gemini.apiKey) {
          configError = 'Google Gemini API key is not configured.';
        }
        break;
      case 'llama-2':
        if (!providers.llama.baseUrl) {
          configError = 'LLaMA endpoint is not configured.';
        }
        break;
    }

    addMessage([{
      type: 'text',
      content: `Switched to ${modelDetails.name} (${modelDetails.provider})\n\n${modelDetails.description}${
        configError ? `\n\n⚠️ Warning: ${configError} Please configure it in the admin settings.` : ''
      }`
    }], 'assistant');
  };

  const detectPurchaseOrder = (text: string): boolean => {
    const poKeywords = [
      'purchase order',
      'po number',
      'order date',
      'unit price',
      'quantity',
      'total amount',
      'bill to',
      'ship to',
    ];
    
    const lowerText = text.toLowerCase();
    return poKeywords.some(keyword => lowerText.includes(keyword));
  };

  const getAIResponse = async (prompt: string) => {
    // Validate provider configuration before making the request
    switch (model) {
      case 'claude-v2':
        if (!providers.bedrock.accessKeyId || !providers.bedrock.secretAccessKey) {
          throw new Error('AWS Bedrock credentials are not configured. Please check the admin settings.');
        }
        return await getBedrockResponse(prompt);
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        if (!providers.openai.apiKey) {
          throw new Error('OpenAI API key is not configured. Please check the admin settings.');
        }
        return await getOpenAIResponse(prompt, providers.openai.apiKey, model);
      case 'gemini-pro':
        if (!providers.gemini.apiKey) {
          throw new Error('Gemini API key is not configured. Please check the admin settings.');
        }
        return await getGeminiResponse(prompt, providers.gemini.apiKey);
      case 'llama-2':
        if (!providers.llama.baseUrl) {
          throw new Error('LLaMA endpoint is not configured. Please check the admin settings.');
        }
        return await getLlamaResponse(prompt, providers.llama.baseUrl);
      default:
        throw new Error('Selected model is not supported');
    }
  };

  const processPromptWithContext = async (prompt: string) => {
    if (!documentContext) {
      addMessage(
        [{ type: 'text', content: 'Please upload a purchase order document first.' }],
        'assistant'
      );
      return;
    }

    setLoading(true);

    try {
      const fullPrompt = `
Context (Purchase Order Document):
${documentContext.content}

Previous conversation context:
${messages
  .slice(-5) // Get last 5 messages for context
  .map(m => `${m.role}: ${m.content.map(c => c.type === 'text' ? c.content : '').join(' ')}`)
  .join('\n')}

Task:
${prompt}

Please process this purchase order according to the requested format.`;

      const response = await getAIResponse(fullPrompt);

      if (response.error) {
        throw new Error(response.error);
      }

      addMessage([{ type: 'text', content: response.content }], 'assistant');
    } catch (error) {
      addMessage(
        [{
          type: 'text',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }],
        'assistant'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (mediaContent: MediaContent[]) => {
    addMessage(mediaContent, 'user');
    setLoading(true);

    const textContent = mediaContent
      .filter((m) => m.type === 'text')
      .map((m) => m.content)
      .join('\n');

    const pdfContent = mediaContent
      .filter((m) => m.type === 'pdf' && m.pdfText)
      .map((m) => m.pdfText)
      .join('\n');

    if (pdfContent) {
      const isPurchaseOrder = detectPurchaseOrder(pdfContent);
      
      // Update document context with the new PDF
      setDocumentContext({
        id: crypto.randomUUID(),
        content: pdfContent,
        fileName: mediaContent.find(m => m.type === 'pdf')?.fileName || 'document.pdf',
        timestamp: new Date()
      });
      
      if (isPurchaseOrder) {
        addMessage([
          {
            type: 'text',
            content: "I've detected this is a Purchase Order document. Would you like me to:\n\n" +
              PO_PROMPTS.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n'),
          },
        ], 'assistant');
        setLoading(false);
        return;
      }
    }

    // If it's a number response to the prompt list
    if (textContent.match(/^[1-4]$/)) {
      const promptIndex = parseInt(textContent) - 1;
      if (promptIndex >= 0 && promptIndex < PO_PROMPTS.length) {
        await processPromptWithContext(PO_PROMPTS[promptIndex]);
        return;
      }
    }

    // Handle regular messages with context
    try {
      const conversationContext = messages
        .slice(-5) // Get last 5 messages for context
        .map(m => `${m.role}: ${m.content.map(c => c.type === 'text' ? c.content : '').join(' ')}`)
        .join('\n');

      const fullPrompt = `
${documentContext ? `Document Context:\n${documentContext.content}\n\n` : ''}
Previous conversation:\n${conversationContext}\n\n
User's request:\n${textContent}`;

      const response = await getAIResponse(fullPrompt);

      if (response.error) {
        throw new Error(response.error);
      }

      addMessage([{ type: 'text', content: response.content }], 'assistant');
    } catch (error) {
      addMessage(
        [{
          type: 'text',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }],
        'assistant'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: string) => {
    const promptIndex = PO_PROMPTS.indexOf(action);
    if (promptIndex !== -1) {
      await processPromptWithContext(action);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatHeader
        model={model}
        onModelChange={handleModelChange}
        onClearChat={clearMessages}
        onThemeToggle={toggleTheme}
        theme={theme}
      />

      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-6 p-8 text-center">
            <h2 className="text-2xl font-bold dark:text-white">
              Purchase Order Processing Assistant
            </h2>
            <div className="max-w-md space-y-2 text-gray-600 dark:text-gray-300">
              <p>Upload a Purchase Order document and I'll help you convert it to CSV format.</p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                id={`message-${message.id}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                tabIndex={0}
                onActionClick={handleActionClick}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
}