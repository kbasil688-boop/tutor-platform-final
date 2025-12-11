import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Video, Users, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer">
          TUTOR<span className="text-white">HUB</span>
        </h1>
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <a href="#" className="hover:text-yellow-400 transition">FIND A TUTOR</a>
          <a href="#" className="hover:text-yellow-400 transition">BECOME A TUTOR</a>
          <button className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            LOGIN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 mt-20 text-center relative overflow-hidden">
        
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-yellow-400 mb-8 border border-slate-700">
          <Star size={14} fill="currentColor" />
          <span>The #1 Platform for University Success</span>
        </div>
        
        <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          MASTER YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            MODULES.
          </span>
        </h2>
        
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Struggling with Calculus? Java causing headaches? 
          Get instant access to top-tier student tutors or watch recorded crash courses.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-24">
          {/* This button is now wrapped in a Link */}
          <Link href="/find-tutor">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition transform hover:scale-105 shadow-lg shadow-blue-600/25">
              <Users size={20} />
              Find a Tutor Now
            </button>
          </Link>

        {/* Second Button Link */}
          <Link href="/videos">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition border border-slate-700 hover:border-slate-600">
              <Video size={20} />
              Browse Recorded Lessons
            </button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left pb-20">
          <FeatureCard 
            icon={<Video className="text-pink-500" size={32} />}
            title="Video Library"
            desc="Tutors upload recorded lessons. Watch at 2x speed. Learn faster."
            color="hover:border-pink-500/50"
          />
          <FeatureCard 
            icon={<Users className="text-cyan-400" size={32} />}
            title="1-on-1 Sessions"
            desc="Book a tutor instantly like an Uber. Pay per session securely."
            color="hover:border-cyan-400/50"
          />
          <FeatureCard 
            icon={<BookOpen className="text-yellow-400" size={32} />}
            title="Earn Money"
            desc="Are you a smart student? Upload lessons and get paid while you sleep."
            color="hover:border-yellow-400/50"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className={`p-8 bg-slate-800/40 border border-slate-700/50 rounded-3xl transition duration-300 hover:-translate-y-1 group ${color}`}>
      <div className="mb-4 bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition border border-slate-800">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}