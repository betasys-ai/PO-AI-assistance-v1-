import type { AIResponse } from './types';

export async function getLlamaResponse(
  message: string,
  baseUrl: string
): Promise<AIResponse> {
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        model: 'llama-2',
      }),
    });

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || 'No response generated',
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}