'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Added Suspense
import { supabase } from '../lib/supabaseClient';
import { Play, Lock, ArrowLeft, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams

// We need a wrapper component to handle the URL search params safely
function VideoLibraryContent() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // 1. GET ID FROM URL (New Logic)
  const searchParams = useSearchParams();
  const autoPlayId = searchParams.get('play'); 

  // 2. FETCH LESSONS
  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, tutors(profiles(full_name))')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching lessons:", error);
      } else {
        setLessons(data || []);
        
        // --- SMART PLAY LOGIC ---
        if (data && data.length > 0) {
          if (autoPlayId) {
            // If URL has ?play=123, play that specific video
            const specificLesson = data.find((l: any) => l.id.toString() === autoPlayId);
            setActiveLesson(specificLesson || data[0]);
          } else {
            // Otherwise, play the newest one
            setActiveLesson(data[0]);
          }
        }
      }
      setLoading(false);
    };

    fetchLessons();
  }, [autoPlayId]); // Re-run if the URL changes

  // Helper to convert YouTube links
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url; 
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Library...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* Top Bar */}
      <nav className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg hidden md:block">
              {activeLesson ? activeLesson.title : "Video Library"}
            </h1>
            <p className="text-zinc-400 text-xs">
              {activeLesson 
                ? `By ${activeLesson.tutors?.profiles?.full_name || 'Unknown Tutor'}` 
                : 'Select a video to start learning'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-700 border border-zinc-700"
        >
          My Dashboard
        </button>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        
        {/* MAIN VIDEO PLAYER AREA */}
        <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-6 border-r border-zinc-800 relative">
          
          {activeLesson ? (
            <div className="w-full max-w-4xl aspect-video bg-zinc-900 rounded-xl overflow-hidden relative shadow-2xl shadow-blue-900/10 border border-zinc-800">
              <iframe 
                src={getEmbedUrl(activeLesson.video_url)} 
                title={activeLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="text-zinc-500">No videos available yet. Be the first to upload one!</div>
          )}

          <div className="w-full max-w-4xl mt-6">
            <h2 className="text-2xl font-bold mb-2">{activeLesson?.title}</h2>
            <p className="text-zinc-400">{activeLesson?.description || "No description provided."}</p>
          </div>
        </div>

        {/* SIDEBAR: LESSON LIST */}
        <div className="w-full lg:w-96 bg-zinc-900 overflow-y-auto">
          <div className="p-4 font-bold text-zinc-400 text-sm uppercase tracking-wider border-b border-zinc-800">
            Available Lessons ({lessons.length})
          </div>
          
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className={`p-4 flex items-center justify-between border-b border-zinc-800 cursor-pointer transition group
                ${activeLesson?.id === lesson.id ? 'bg-zinc-800 border-l-4 border-l-yellow-400' : 'hover:bg-zinc-800/50'}
              `}
            >
              <div className="flex items-center gap-3">
                 <div className="text-zinc-500 text-xs font-mono">{index + 1}</div>
                 
                 <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-500 group-hover:text-white transition">
                    <Play size={16} fill="currentColor" />
                 </div>

                 <div>
                    <h4 className={`text-sm font-medium ${activeLesson?.id === lesson.id ? 'text-white' : 'text-zinc-300'}`}>
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                      <span className="flex items-center gap-1"><User size={10} /> {lesson.tutors?.profiles?.full_name}</span>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MAIN EXPORT (Wraps the content in Suspense to prevent build errors)
export default function VideoLibrary() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <VideoLibraryContent />
    </Suspense>
  );
}