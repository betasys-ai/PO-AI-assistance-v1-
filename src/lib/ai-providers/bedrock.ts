import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { useConfigStore } from '../../store/config-store';
import type { AIResponse } from './types';

export async function getBedrockResponse(message: string): Promise<AIResponse> {
  try {
    const { providers } = useConfigStore.getState();
    const { accessKeyId, secretAccessKey, region } = providers.bedrock;

    // Enhanced credentials validation
    if (!accessKeyId || accessKeyId.trim() === '') {
      throw new Error('AWS Access Key ID is missing or invalid');
    }
    if (!secretAccessKey || secretAccessKey.trim() === '') {
      throw new Error('AWS Secret Access Key is missing or invalid');
    }
    if (!region || !region.match(/^[a-z]{2}-[a-z]+-\d{1}$/)) {
      throw new Error('Invalid AWS region format. Example: us-east-1');
    }

    const client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      maxAttempts: 3,
      retryMode: 'adaptive',
    });

    const systemPrompt = `You are an AI assistant specialized in processing purchase orders and converting them into structured formats. When working with PO documents:
1. Identify and extract key information like item details, quantities, prices, and totals
2. Format data in a clean, consistent CSV structure
3. Ensure all numerical values are properly formatted
4. Include headers for each column
5. Handle special characters and text formatting appropriately

For CSV output:
- Use comma as delimiter
- Escape special characters
- Format numbers consistently
- Align similar data in the same columns`;

    const prompt = `${systemPrompt}\n\nHuman: ${message}\n\nAssistant:`;
    
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 2000,
        temperature: 0.2,
        top_p: 0.9,
        anthropic_version: "bedrock-2023-05-31"
      }),
    });

    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const result = JSON.parse(responseBody);

    if (!result.completion) {
      throw new Error('No response received from Bedrock');
    }

    return {
      content: result.completion.trim(),
    };
  } catch (error) {
    console.error('Bedrock error:', error);
    let errorMessage = 'An unexpected error occurred while connecting to AWS Bedrock';
    
    if (error instanceof Error) {
      // Handle specific AWS errors
      if (error.name === 'AccessDeniedException') {
        errorMessage = 'Access denied. Please verify your AWS credentials have permission to access Bedrock and try again.';
      } else if (error.name === 'ValidationException') {
        errorMessage = 'Invalid request format. Please check your input and try again.';
      } else if (error.name === 'ThrottlingException') {
        errorMessage = 'Request was throttled. Please try again in a few moments.';
      } else if (error.name === 'ResourceNotFoundException') {
        errorMessage = 'The requested AI model is not available in this region. Please check your region settings.';
      } else if (error.message.includes('security token') || error.message.includes('credentials')) {
        errorMessage = 'Invalid AWS credentials. Please check your Access Key ID and Secret Access Key in the admin settings.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        // Use the actual error message for other cases
        errorMessage = error.message;
      }
    }
    
    return {
      content: '',
      error: errorMessage,
    };
  }
}