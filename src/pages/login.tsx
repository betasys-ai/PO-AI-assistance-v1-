import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileStack, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <FileStack className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">Betasys.ai</span>
          </Link>
        </div>

        <div className="rounded-lg border bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-center text-2xl font-bold">Welcome Back</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-transparent py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border bg-transparent py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}