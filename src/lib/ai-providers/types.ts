export interface AIProvider {
  id: string;
  name: string;
  isEnabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

export interface AIConfig {
  providers: {
    bedrock: AIProvider;
    openai: AIProvider;
    gemini: AIProvider;
    llama: AIProvider;
  };
}