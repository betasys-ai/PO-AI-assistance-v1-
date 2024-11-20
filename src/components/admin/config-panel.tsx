import React, { useState } from 'react';
import { useConfigStore } from '../../store/config-store';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function ConfigPanel() {
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const store = useConfigStore();
  
  // Early return with loading state if store isn't initialized
  if (!store.providers) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { providers, updateProvider, validateCredentials } = store;

  const handleProviderUpdate = (
    provider: keyof typeof providers,
    field: string,
    value: string | boolean
  ) => {
    updateProvider(provider, { [field]: value });
    setValidationMessage(null);
  };

  const handleValidateCredentials = () => {
    const { isValid, errors } = validateCredentials();
    
    if (isValid) {
      setValidationMessage({
        type: 'success',
        message: 'All credentials are valid!'
      });
    } else {
      setValidationMessage({
        type: 'error',
        message: errors.join('\n')
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Provider Configuration</h1>
        <button
          onClick={handleValidateCredentials}
          className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Validate Credentials
        </button>
      </div>

      {validationMessage && (
        <div className={`mb-6 flex items-start gap-2 rounded-lg p-4 ${
          validationMessage.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {validationMessage.type === 'success' ? (
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          )}
          <pre className="whitespace-pre-wrap text-sm">{validationMessage.message}</pre>
        </div>
      )}
      
      <div className="space-y-6">
        {/* AWS Bedrock Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">AWS Bedrock (Claude)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bedrock-enabled"
                checked={providers.bedrock?.isEnabled ?? false}
                onChange={(e) =>
                  handleProviderUpdate('bedrock', 'isEnabled', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="bedrock-enabled">Enable AWS Bedrock</label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Access Key ID</label>
              <input
                type="password"
                value={providers.bedrock?.accessKeyId ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('bedrock', 'accessKeyId', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                placeholder="AKIA..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Secret Access Key</label>
              <input
                type="password"
                value={providers.bedrock?.secretAccessKey ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('bedrock', 'secretAccessKey', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Region</label>
              <input
                type="text"
                value={providers.bedrock?.region ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('bedrock', 'region', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                placeholder="us-east-1"
              />
            </div>
          </div>
        </div>

        {/* OpenAI Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">OpenAI</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="openai-enabled"
                checked={providers.openai?.isEnabled ?? false}
                onChange={(e) =>
                  handleProviderUpdate('openai', 'isEnabled', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="openai-enabled">Enable OpenAI</label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">API Key</label>
              <input
                type="password"
                value={providers.openai?.apiKey ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('openai', 'apiKey', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                placeholder="sk-..."
              />
            </div>
          </div>
        </div>

        {/* Gemini Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Google Gemini</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gemini-enabled"
                checked={providers.gemini?.isEnabled ?? false}
                onChange={(e) =>
                  handleProviderUpdate('gemini', 'isEnabled', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="gemini-enabled">Enable Gemini</label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">API Key</label>
              <input
                type="password"
                value={providers.gemini?.apiKey ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('gemini', 'apiKey', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                placeholder="AI..."
              />
            </div>
          </div>
        </div>

        {/* LLaMA Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">LLaMA</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="llama-enabled"
                checked={providers.llama?.isEnabled ?? false}
                onChange={(e) =>
                  handleProviderUpdate('llama', 'isEnabled', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="llama-enabled">Enable LLaMA</label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Base URL</label>
              <input
                type="text"
                value={providers.llama?.baseUrl ?? ''}
                onChange={(e) =>
                  handleProviderUpdate('llama', 'baseUrl', e.target.value)
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                placeholder="http://localhost:11434"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}