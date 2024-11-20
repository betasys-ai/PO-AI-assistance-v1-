import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIConfig } from '../lib/ai-providers/types';

interface ConfigState extends AIConfig {
  updateProvider: (
    provider: keyof AIConfig['providers'],
    updates: Partial<AIConfig['providers'][keyof AIConfig['providers']]>
  ) => void;
  validateCredentials: () => { isValid: boolean; errors: string[] };
}

const initialState: AIConfig = {
  providers: {
    bedrock: {
      id: 'bedrock',
      name: 'AWS Bedrock (Claude)',
      isEnabled: true,
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      isEnabled: true,
      apiKey: '',
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      isEnabled: false,
      apiKey: '',
    },
    llama: {
      id: 'llama',
      name: 'LLaMA',
      isEnabled: false,
      baseUrl: 'http://localhost:11434',
    },
  },
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ...initialState,
      updateProvider: (provider, updates) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              ...updates,
            },
          },
        })),
      validateCredentials: () => {
        const { providers } = get();
        const errors: string[] = [];

        // Validate AWS Bedrock credentials
        if (providers.bedrock.isEnabled) {
          if (!providers.bedrock.accessKeyId?.trim()) {
            errors.push('AWS Access Key ID is required');
          } else if (!providers.bedrock.accessKeyId.startsWith('AKIA')) {
            errors.push('Invalid AWS Access Key ID format');
          }

          if (!providers.bedrock.secretAccessKey?.trim()) {
            errors.push('AWS Secret Access Key is required');
          }

          if (!providers.bedrock.region?.match(/^[a-z]{2}-[a-z]+-\d{1}$/)) {
            errors.push('Invalid AWS region format (e.g., us-east-1)');
          }
        }

        // Validate OpenAI credentials
        if (providers.openai.isEnabled && !providers.openai.apiKey?.trim()) {
          errors.push('OpenAI API key is required');
        }

        // Validate Gemini credentials
        if (providers.gemini.isEnabled && !providers.gemini.apiKey?.trim()) {
          errors.push('Google Gemini API key is required');
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },
    }),
    {
      name: 'ai-config',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);