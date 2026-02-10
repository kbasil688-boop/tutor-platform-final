'use client';

import dynamic from 'next/dynamic';

// Import the Client Component safely
const FindTutorClient = dynamic(() => import('./FindTutorClient'), {
  ssr: false, // Prevents "window not defined" error
  loading: () => <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Tutors...</div>
});

export default function FindTutorPage() {
  return <FindTutorClient />;
}