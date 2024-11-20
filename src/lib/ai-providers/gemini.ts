import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIResponse } from './types';

export async function getGeminiResponse(
  message: string,
  apiKey: string
): Promise<AIResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return {
      content: response.text(),
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}