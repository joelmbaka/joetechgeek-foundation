// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CourseCard from '@/components/CourseCard';

type Course = {
  id: string;
  title: string;
  description: string;
};

type EnrolledCourse = Course & {
  status: 'not_started' | 'ongoing' | 'completed' | 'certified';
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  const handleEnroll = async (courseId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase.from('enrollments').insert({
      user_id: session.user.id,
      course_id: courseId,
      status: 'not_started',
    });

    if (error && error.code !== '23505') {
      return;
    }

    loadData();
  };

  const handleGetStarted = async (courseId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('status')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .single();

    if (enrollment?.status === 'not_started') {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'ongoing' })
        .eq('user_id', session.user.id)
        .eq('course_id', courseId);

      if (!error) {
        setEnrolledCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, status: 'ongoing' as const } : c))
        );
      }
    }

    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (!modules || modules.length === 0) {
      return;
    }

    const moduleIds = modules.map((m) => m.id);

    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, order_index, module_id')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true });

    if (lessonsError || !allLessons || allLessons.length === 0) {
      return;
    }

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', session.user.id)
      .in('lesson_id', allLessons.map((l) => l.id))
      .eq('status', 'completed');

    const completedLessonIds = new Set(progressData?.map((p) => p.lesson_id) || []);

    const nextLesson = allLessons.find((lesson) => !completedLessonIds.has(lesson.id));
    const nextLessonId = nextLesson?.id || allLessons[0].id;

    if (nextLessonId) {
      router.push(`/lesson/${nextLessonId}`);
    }
  };

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/signin');
      return;
    }

    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select('course_id, status, courses(id, title, description)')
      .eq('user_id', session.user.id);

    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, title, description')
      .order('created_at', { ascending: true });

    if (enrollmentsData) {
      const enrolled: EnrolledCourse[] = enrollmentsData.map((e: any) => ({
        id: e.courses.id,
        title: e.courses.title,
        description: e.courses.description,
        status: e.status,
      }));
      setEnrolledCourses(enrolled);
    }

    if (coursesData) {
      const enrolledIds = new Set(enrollmentsData?.map((e: any) => e.course_id) || []);
      const available = coursesData.filter((c) => !enrolledIds.has(c.id));
      setCourses(available);
    }

    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadData();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/signup');
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted) {
          loadData();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading dashboard…</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div>
            <button
              className="px-3 py-1 rounded border"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace('/');
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mb-8" id="enrolled-section">
          <h2 className="text-xl font-semibold mb-4">Enrolled</h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrolledCourses.map((c) => (
                <CourseCard key={c.id} course={c} status={c.status} onGetStarted={handleGetStarted} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center bg-gray-50 dark:bg-slate-800/50">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No courses enrolled yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You currently haven't enrolled in any courses. Browse available courses below and start your learning journey!
                </p>
              </div>
            </div>
          )}
        </section>

        <section id="courses-section">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} onEnroll={handleEnroll} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

