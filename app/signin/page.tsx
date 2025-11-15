// app/signin/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !password) {
      setErrorMsg('Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setErrorMsg('Please confirm your email address before signing in. Check your inbox for the confirmation email.');
          setShowResend(true);
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        setErrorMsg('Sign in failed. Please try again.');
        setLoading(false);
        return;
      }

      setInfoMsg('Signing in...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }

    setResending(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setInfoMsg('Confirmation email sent! Please check your inbox.');
        setShowResend(false);
      }
    } catch (err: any) {
      setErrorMsg('Failed to resend confirmation email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-xl p-8 shadow relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm">Password</span>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </label>

          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
          {infoMsg && <div className="text-sm text-blue-600">{infoMsg}</div>}

          {showResend && (
            <div className="text-sm">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="text-sky-600 hover:text-sky-700 underline disabled:opacity-60"
              >
                {resending ? 'Sending...' : 'Resend confirmation email'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-sky-600 text-white px-4 py-2 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          Don't have an account?{' '}
          <a className="underline" href="/signup">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

