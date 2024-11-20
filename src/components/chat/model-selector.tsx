import React from 'react';
import { Brain } from 'lucide-react';
import type { Model } from '../../store/chat-store';

interface ModelSelectorProps {
  model: Model;
  onChange: (model: Model) => void;
}

const models: { value: Model; label: string }[] = [
  { value: 'claude-v2', label: 'Claude v2' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'llama-2', label: 'LLaMA 2' },
];

export function ModelSelector({ model, onChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Brain className="h-5 w-5 text-purple-200" />
      <select
        value={model}
        onChange={(e) => onChange(e.target.value as Model)}
        className="rounded-md border-gray-300 bg-white/10 py-1 text-sm text-purple-100 focus:border-purple-400 focus:ring-purple-400 dark:border-gray-600"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value} className="bg-slate-800 text-white">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}