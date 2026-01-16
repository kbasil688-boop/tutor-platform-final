'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Video, Users, Star } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 max-w-7xl mx-auto border-b border-slate-800 gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer">
            TUTOR<span className="text-white">HUB</span>
          </h1>
          
          {/* Mobile Login Button (Visible on small screens) */}
          <div className="md:hidden">
            {user ? (
              <Link href="/dashboard">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border border-yellow-400">
                   {user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href="/auth">
                <button className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-full">
                  LOGIN
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="/find-tutor" className="hover:text-yellow-400 transition">FIND A TUTOR</Link>
          <a href="#" className="hover:text-yellow-400 transition">BECOME A TUTOR</a>
          
          {user ? (
            <Link href="/dashboard">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer border-2 border-yellow-400 hover:scale-105 transition">
                 {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/auth">
              <button className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                LOGIN
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-20 text-center relative">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/20 blur-[80px] md:blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs md:text-sm text-yellow-400 mb-6 border border-slate-700">
          <Star size={12} fill="currentColor" />
          <span>The #1 Platform for University Success</span>
        </div>
        
        {/* Responsive Text Size: Text-4xl on mobile, Text-8xl on desktop */}
        <h2 className="text-4xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
          MASTER YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            MODULES.
          </span>
        </h2>
        
        <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed px-2">
          Struggling with Calculus? Java causing headaches? 
          Get instant access to top-tier student tutors or watch recorded crash courses.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16 md:mb-24 w-full px-4">
          <Link href="/find-tutor" className="w-full md:w-auto">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition transform hover:scale-105 shadow-lg shadow-blue-600/25">
              <Users size={20} />
              Find a Tutor Now
            </button>
          </Link>

          <Link href="/find-tutor" className="w-full md:w-auto">
            <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition border border-slate-700 hover:border-slate-600">
              <Video size={20} />
              Browse Recorded Lessons
            </button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left pb-20">
          <FeatureCard 
            icon={<Video className="text-pink-500" size={28} />}
            title="Video Library"
            desc="Tutors upload recorded lessons. Watch at 2x speed. Learn faster."
            color="hover:border-pink-500/50"
          />
          <FeatureCard 
            icon={<Users className="text-cyan-400" size={28} />}
            title="1-on-1 Sessions"
            desc="Book a tutor instantly like an Uber. Pay per session securely."
            color="hover:border-cyan-400/50"
          />
          <FeatureCard 
            icon={<BookOpen className="text-yellow-400" size={28} />}
            title="Earn Money"
            desc="Are you a smart student? Upload lessons and get paid while you sleep."
            color="hover:border-yellow-400/50"
          />
        </div>
      </main>

      {/* COPYRIGHT FOOTER */}
      <footer className="border-t border-slate-800 mt-10 py-8 text-center bg-slate-950 px-4">
        <p className="text-slate-500 text-xs md:text-sm">
          © {new Date().getFullYear()} TutorHub. All Rights Reserved.
        </p>
        <p className="text-slate-400 font-bold mt-2 text-sm">
          Created by <span className="text-yellow-400">Chulumanco Basil Zono</span> and <span className="text-blue-400">Luvo Jindela</span>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className={`p-6 md:p-8 bg-slate-800/40 border border-slate-700/50 rounded-3xl transition duration-300 hover:-translate-y-1 group ${color}`}>
      <div className="mb-4 bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition border border-slate-800">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 text-sm md:text-base leading-relaxed">{desc}</p>
    </div>
  )
}