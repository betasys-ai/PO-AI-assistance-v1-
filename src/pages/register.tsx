import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileStack, Mail, Lock, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { register, verifyEmail, resendVerificationCode } = useAuthStore();

  useEffect(() => {
    let timer: number;
    if (resendTimer > 0) {
      timer = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
      setStep('verify');
      setResendTimer(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyEmail(email, verificationCode);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      await resendVerificationCode();
      setResendTimer(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h2 className="mb-6 text-center text-2xl font-bold">
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border bg-transparent py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                We've sent a verification code to <strong>{email}</strong>. Please enter it below to complete your registration.
              </p>
              
              <div>
                <label htmlFor="code" className="mb-2 block text-sm font-medium">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-lg border bg-transparent px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  pattern="\d{6}"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading
                    ? 'Sending...'
                    : resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}