'use client';

import React, { useState } from 'react';
import { Play, Lock, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock Data: A "Calculus 101" Course
const LESSONS = [
  { id: 1, title: "1. Introduction to Limits", duration: "12:40", isLocked: false },
  { id: 2, title: "2. The Derivative Definition", duration: "15:20", isLocked: false },
  { id: 3, title: "3. Power Rule & Chain Rule", duration: "18:10", isLocked: true },
  { id: 4, title: "4. Integrals for Beginners", duration: "22:05", isLocked: true },
  { id: 5, title: "5. Final Exam Prep", duration: "45:00", isLocked: true },
];

export default function VideoPage() {
  const [activeLesson, setActiveLesson] = useState(LESSONS[0]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* Top Bar */}
      <nav className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Calculus 101: Master the Basics</h1>
            <p className="text-zinc-400 text-xs">By Thabo M. • 4.9 Stars</p>
          </div>
        </div>
        <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300">
          Get Full Access (R150)
        </button>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        
        {/* Main Video Player Area */}
        <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-6 border-r border-zinc-800 relative">
          
          {/* Fake Video Player UI */}
          <div className="w-full max-w-4xl aspect-video bg-zinc-900 rounded-xl overflow-hidden relative group shadow-2xl shadow-blue-900/10 border border-zinc-800">
            {/* Using a placeholder image for now, later this becomes a real video */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
               <button className="bg-blue-600 hover:bg-blue-500 text-white w-20 h-20 rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(37,99,235,0.5)] transition transform group-hover:scale-110">
                 <Play fill="currentColor" size={32} />
               </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-30">
              <div className="h-full w-[35%] bg-blue-500 relative">
                <div className="absolute right-0 -top-1 w-3 h-3 bg-white rounded-full shadow"></div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl mt-6">
            <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
            <p className="text-zinc-400">In this lesson, we break down the fundamental concept of limits using real-world examples.</p>
          </div>
        </div>

        {/* Sidebar: Lesson List */}
        <div className="w-full lg:w-96 bg-zinc-900 overflow-y-auto">
          <div className="p-4 font-bold text-zinc-400 text-sm uppercase tracking-wider">Course Content</div>
          
          {LESSONS.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => !lesson.isLocked && setActiveLesson(lesson)}
              className={`p-4 flex items-center justify-between border-b border-zinc-800 cursor-pointer transition
                ${activeLesson.id === lesson.id ? 'bg-zinc-800 border-l-4 border-l-yellow-400' : 'hover:bg-zinc-800/50'}
                ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                 <div className="text-zinc-500 text-sm">{lesson.id}</div>
                 <div>
                    <h4 className={`text-sm font-medium ${activeLesson.id === lesson.id ? 'text-white' : 'text-zinc-300'}`}>
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
                      <Clock size={12} /> {lesson.duration}
                    </div>
                 </div>
              </div>
              
              <div>
                {lesson.isLocked ? (
                  <Lock size={16} className="text-zinc-600" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center">
                    <Play size={10} fill="#3b82f6" className="text-blue-500 ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}