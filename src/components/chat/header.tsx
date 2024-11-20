import React from 'react';
import { Moon, Sun, Trash2, FileStack, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModelSelector } from './model-selector';
import { useAuthStore } from '../../store/auth-store';
import type { Model } from '../../store/chat-store';

interface ChatHeaderProps {
  model: Model;
  onModelChange: (model: Model) => void;
  onClearChat: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

export function ChatHeader({
  model,
  onModelChange,
  onClearChat,
  onThemeToggle,
  theme,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-gradient-to-r from-slate-800 to-purple-900 p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileStack className="h-8 w-8 text-purple-200" />
          <h1 className="text-2xl font-bold text-white">betasys.ai</h1>
          <span className="ml-2 rounded-md bg-purple-700/50 px-2 py-1 text-sm text-purple-100">
            PO Assistant
          </span>
        </div>
        <div className="ml-8">
          <ModelSelector model={model} onChange={onModelChange} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onThemeToggle}
          className="rounded-lg p-2 text-purple-100 hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={onClearChat}
          className="rounded-lg p-2 text-purple-100 hover:bg-white/10"
          aria-label="Clear chat"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-purple-100 hover:bg-white/10"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}