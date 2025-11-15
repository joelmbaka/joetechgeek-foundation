// components/CourseCard.tsx
'use client';

import React, { useState } from 'react';

type Course = {
  id: string;
  title: string;
  description: string;
};

type Status = 'not_started' | 'ongoing' | 'completed' | 'certified';

export default function CourseCard({
  course,
  onEnroll,
  onGetStarted,
  status,
}: {
  course: Course;
  onEnroll?: (courseId: string) => Promise<void>;
  onGetStarted?: (courseId: string) => Promise<void>;
  status?: Status;
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleEnroll = async () => {
    if (!onEnroll) return;
    setEnrolling(true);
    try {
      await onEnroll(course.id);
    } finally {
      setEnrolling(false);
    }
  };

  const handleGetStarted = async () => {
    if (!onGetStarted) return;
    setStarting(true);
    try {
      await onGetStarted(course.id);
    } finally {
      setStarting(false);
    }
  };

  const statusLabels: Record<Status, string> = {
    not_started: 'Not started',
    ongoing: 'Ongoing',
    completed: 'Completed',
    certified: 'Certified',
  };

  const statusColors: Record<Status, string> = {
    not_started: 'bg-gray-100 text-gray-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    certified: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold">{course.title}</h3>
        {status && status !== 'not_started' && (
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/70">{course.description}</p>
      {status === 'not_started' && onGetStarted && (
        <button
          onClick={handleGetStarted}
          disabled={starting}
          className="mt-4 w-full px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {starting ? 'Starting...' : 'Get Started'}
        </button>
      )}
      {status === 'ongoing' && onGetStarted && (
        <button
          onClick={handleGetStarted}
          disabled={starting}
          className="mt-4 w-full px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {starting ? 'Loading...' : 'Continue'}
        </button>
      )}
      {onEnroll && (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="mt-4 w-full px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Enrolling...' : 'Enroll now'}
        </button>
      )}
    </div>
  );
}
