'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const supabase = getSupabase();

    try {
      if (mode === 'signup') {
        // Sign Up Flow
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage('Account created! Check your email to confirm your account, or sign in directly.');
          setMode('login');
        }
      } else {
        // Login Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-midnight font-display text-5xl mb-4 glow-md">
              F
            </div>
            <h1 className="font-display text-5xl text-gradient mb-2">FitHood</h1>
            <p className="text-gray-400">Loading...</p>
          </div>
          <div className="glass rounded-2xl p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-electric/30 border-t-electric rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-midnight font-display text-5xl mb-4 glow-md">
          F
        </div>
        <h1 className="font-display text-5xl text-gradient mb-2">FitHood</h1>
        <p className="text-gray-400">Track your fitness journey</p>
      </div>

      {/* Login Card */}
      <div className="glass rounded-2xl p-8 animate-slide-up">
        {/* Mode Toggle */}
        <div className="flex mb-6 p-1 rounded-xl bg-midnight">
          <button
            type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'login' 
                ? 'bg-electric text-midnight' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'signup' 
                ? 'bg-electric text-midnight' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-all mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-obsidian text-gray-400">or use email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-electric focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
              className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-electric focus:outline-none transition-all"
              required
                minLength={6}
            />
          </div>

          {/* Confirm password for signup */}
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-electric focus:outline-none transition-all"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-coral/20 border border-coral/30 text-coral text-sm">
              {error}
            </div>
          )}

            {message && (
              <div className="p-3 rounded-lg bg-electric/20 border border-electric/30 text-electric text-sm">
                {message}
              </div>
            )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-electric to-neon-cyan text-midnight font-semibold hover:glow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {mode === 'signup' 
            ? 'Already have an account? Click Sign In above' 
            : 'New here? Click Sign Up above'}
        </p>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in stagger-3">
        <div className="glass rounded-xl p-4">
          <span className="text-2xl">🍎</span>
          <p className="text-xs text-gray-400 mt-1">Food</p>
        </div>
        <div className="glass rounded-xl p-4">
          <span className="text-2xl">💪</span>
          <p className="text-xs text-gray-400 mt-1">Workouts</p>
        </div>
        <div className="glass rounded-xl p-4">
          <span className="text-2xl">📊</span>
          <p className="text-xs text-gray-400 mt-1">Analytics</p>
        </div>
      </div>
    </div>
    </div>
  );
}
