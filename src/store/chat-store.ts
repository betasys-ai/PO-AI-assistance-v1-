import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'text' | 'image' | 'pdf';

export type MediaContent = {
  type: MediaType;
  content: string;
  mimeType?: string;
  pdfText?: string;
  fileName?: string;
};

export type Message = {
  id: string;
  content: MediaContent[];
  role: 'user' | 'assistant';
  timestamp: Date;
};

export type DocumentContext = {
  id: string;
  content: string;
  fileName: string;
  timestamp: Date;
};

export type Model = 'claude-v2' | 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'llama-2';

interface ChatState {
  messages: Message[];
  model: Model;
  loading: boolean;
  theme: 'light' | 'dark';
  documentContext: DocumentContext | null;
  addMessage: (content: MediaContent[], role: Message['role']) => void;
  setModel: (model: Model) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  toggleTheme: () => void;
  setDocumentContext: (context: DocumentContext | null) => void;
  clearDocumentContext: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      model: 'claude-v2',
      loading: false,
      theme: 'light',
      documentContext: null,

      addMessage: (content, role) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              content,
              role,
              timestamp: new Date(),
            },
          ],
        })),

      setModel: (model) => set({ model }),
      setLoading: (loading) => set({ loading }),
      
      clearMessages: () => 
        set((state) => ({
          messages: [],
          // Preserve document context when clearing messages
          documentContext: state.documentContext
        })),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setDocumentContext: (context) => set({ documentContext: context }),
      
      clearDocumentContext: () => set({ documentContext: null }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        theme: state.theme,
        documentContext: state.documentContext,
      }),
    }
  )
);