'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Video, Users, Star, CheckCircle, GraduationCap, Heart } from 'lucide-react';
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
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center w-full md:w-auto">
            
            {/* --- NEW LOGO --- */}
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20 group-hover:border-yellow-400/50 transition">
                <GraduationCap className="text-yellow-400 group-hover:rotate-12 transition duration-300" size={28} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Tut<span className="text-white">Buddy</span>
              </h1>
            </Link>
            
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

          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            <Link href="/find-tutor" className="hover:text-yellow-400 transition">FIND A TUTOR</Link>
            <Link href="/auth" className="hover:text-yellow-400 transition">BECOME A TUTOR</Link>
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
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative w-full pt-32 pb-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
            alt="Students studying" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs md:text-sm text-yellow-400 mb-6 border border-slate-700">
              <Star size={12} fill="currentColor" />
              <span>The #1 Platform for University Success</span>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
              MASTER YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                MODULES.
              </span>
            </h2>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Struggling with Calculus? Java causing headaches? 
              Get instant access to top-tier student tutors who have aced exactly what you are studying.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full">
              <Link href="/find-tutor" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition transform hover:scale-105 shadow-lg shadow-blue-600/25">
                  <Users size={20} />
                  Find a Tutor Now
                </button>
              </Link>
              <Link href="/find-tutor" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition border border-slate-700 hover:border-slate-600">
                  <Video size={20} />
                  Browse Recorded Lessons
                </button>
              </Link>
            </div>
        </div>
      </main>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Video className="text-pink-500" size={28} />}
              title="Video Library"
              desc="Tutors upload recorded lessons. Watch at 2x speed. Learn faster."
              color="hover:border-pink-500/50"
            />
            <FeatureCard 
              icon={<Users className="text-cyan-400" size={28} />}
              title="1-on-1 Sessions"
              desc="Book a tutor instantly on-demand. Live video calls to solve your problems."
              color="hover:border-cyan-400/50"
            />
            <FeatureCard 
              icon={<BookOpen className="text-yellow-400" size={28} />}
              title="Earn Money"
              desc="Are you a smart student? Upload lessons and get paid while you sleep."
              color="hover:border-yellow-400/50"
            />
          </div>
        </div>
      </section>

      {/* --- TRUST SECTION --- */}
      <section className="py-20 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black">Built for Students, <br/> <span className="text-blue-500">By Students.</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                We know the struggle of late-night cramming. We know the panic of a looming deadline. 
                TutBuddy isn't just a website; it's a community where seniors help juniors succeed.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-green-500" size={20}/> Tutors from your own University and neighbouring universities</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-green-500" size={20}/> Affordable Student Rates</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-green-500" size={20}/> Instant Availability</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-green-500" size={20}/> Group Sessions (Invite friends & split the cost)</li>
              </ul>
           </div>
           
           <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-yellow-400/20 blur-xl rounded-full"></div>
              {/* IMAGE: Pointing to your local file in /public/tutor-real.jpg */}
              <img 
                src="/tutor-real.jpg" 
                alt="Student on video call taking notes" 
                className="relative rounded-2xl shadow-2xl border border-slate-700 rotate-2 hover:rotate-0 transition duration-500 transform hover:scale-[1.02]"
              />
           </div>
        </div>
      </section>

      {/* --- ABOUT US --- */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
           <p className="text-slate-400 mb-12">The minds behind the platform.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Founder 1 */}
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4 text-left hover:border-blue-500/50 transition duration-300 group">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600 shadow-lg shadow-blue-900/50 group-hover:scale-110 transition">
                    C
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Chulumanco Basil Zono</h3>
                    <p className="text-blue-400 text-sm font-bold">Co-Founder</p>
                    <p className="text-slate-500 text-xs mt-1">"Building tech to empower minds."</p>
                 </div>
              </div>

              {/* Founder 2 */}
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4 text-left hover:border-yellow-500/50 transition duration-300 group">
                 <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600 shadow-lg shadow-yellow-900/50 group-hover:scale-110 transition">
                    L
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Luvo Jindela</h3>
                    <p className="text-yellow-400 text-sm font-bold">Co-Founder</p>
                    <p className="text-slate-500 text-xs mt-1">"Connecting students to success."</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- COPYRIGHT FOOTER --- */}
      <footer className="border-t border-slate-800 py-10 text-center bg-slate-950 px-4">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-500">
           
        </div>
        <p className="text-slate-500 text-xs md:text-sm">
          © {new Date().getFullYear()} TutBuddy. All Rights Reserved.
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