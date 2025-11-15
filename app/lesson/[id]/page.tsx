// app/lesson/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  content: string;
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/signin');
        return;
      }

      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select('id, title, order_index, content, module_id')
        .eq('id', lessonId)
        .single();

      if (error || !lessonData) {
        router.replace('/dashboard');
        return;
      }

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      setLesson(lessonData);
      setIsCompleted(progressData?.status === 'completed');
      setLoading(false);
    };

    loadLesson();
  }, [lessonId, router]);

  const handleCompleteLesson = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setCompleting(true);

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: session.user.id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      );

    if (!error) {
      setIsCompleted(true);
      setShowCongrats(true);
    }

    setCompleting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading lesson…</div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-sky-600 hover:text-sky-700"
        >
          ← Back to Dashboard
        </button>
        <article className="bg-white dark:bg-slate-800 rounded-xl border p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground/90">{lesson.content}</div>
          </div>
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleCompleteLesson}
              disabled={isCompleted || completing}
              className="w-full px-6 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            >
              {isCompleted ? '✓ Lesson Completed' : completing ? 'Completing...' : 'Complete Lesson'}
            </button>
          </div>
        </article>

        {showCongrats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-8 shadow-lg max-w-md w-full text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-foreground/70 mb-6">
                You've successfully completed this lesson. Great job!
              </p>
              <button
                onClick={() => {
                  setShowCongrats(false);
                  router.push('/dashboard');
                }}
                className="w-full px-6 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

