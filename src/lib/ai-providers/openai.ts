import OpenAI from 'openai';
import type { AIResponse } from './types';

export async function getOpenAIResponse(
  message: string,
  apiKey: string,
  model: 'gpt-4' | 'gpt-3.5-turbo'
): Promise<AIResponse> {
  try {
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in processing purchase orders and converting them into structured formats.'
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      content: response.choices[0]?.message?.content || 'No response generated',
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your settings.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      content: '',
      error: errorMessage,
    };
  }
}