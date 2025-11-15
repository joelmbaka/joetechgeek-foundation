// app/signup/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [idleMismatch, setIdleMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  // Set idleMismatch only if user stopped typing for 1s and passwords don't match
  useEffect(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    setIdleMismatch(false);
    // only check if confirm has value
    if (!confirm) return;
    idleTimer.current = window.setTimeout(() => {
      setIdleMismatch(password !== confirm);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !fullName || !password || !confirm) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', data.user.id);
      }

      if (!data.session) {
        setInfoMsg('Account created! Please check your email to confirm your account.');
        setLoading(false);
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        setInfoMsg('Account created! Please check your email to confirm your account.');
        setLoading(false);
        return;
      }

      setInfoMsg('Account created. Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during signup.');
      setLoading(false);
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
        <h2 className="text-2xl font-semibold mb-4 mt-8">Create account</h2>

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
            <span className="text-sm">Full Name</span>
            <input
              autoComplete="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm">Password</span>
            <input
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
              minLength={6}
            />
          </label>

          <label className="block">
            <span className="text-sm">Confirm password</span>
            <input
              autoComplete="new-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
              minLength={6}
            />
          </label>

          <div className="text-sm h-5">
            {confirm && password === confirm && (
              <span className="text-green-600">Passwords match</span>
            )}
            {confirm && idleMismatch && (
              <span className="text-red-600">Passwords don’t match</span>
            )}
          </div>

          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
          {infoMsg && <div className="text-sm text-blue-600">{infoMsg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-sky-600 text-white px-4 py-2 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <a className="underline" href="/signin">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
