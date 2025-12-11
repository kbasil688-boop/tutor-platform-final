'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // We import the connection we just made

export default function FindTutorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tutors, setTutors] = useState<any[]>([]); // This holds the real data from DB
  const [loading, setLoading] = useState(true);

  // This runs automatically when the page loads (like a Constructor or Main method)
  useEffect(() => {
    const fetchTutors = async () => {
      // 1. Ask Supabase for everything in the 'tutors' table
      const { data, error } = await supabase
        .from('tutors')
        .select('*');
      
      if (error) {
        console.error("Error fetching tutors:", error);
      } else {
        // 2. Save the data to our state variable
        setTutors(data || []);
      }
      setLoading(false);
    };

    fetchTutors();
  }, []);

  // Filter logic
  const filteredTutors = tutors.filter(tutor => 
    tutor.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-bold">
            <ArrowLeft size={16} /> BACK HOME
          </Link>
          
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search subjects (e.g. Calculus, Java)..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white">
            <Filter size={18} /> Filters
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Available Tutors <span className="text-slate-500 text-lg font-normal">({filteredTutors.length})</span></h2>
        
        {loading ? (
          <div className="text-center text-slate-500 mt-20">Loading tutors from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <div key={tutor.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400/50 transition hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Generates a random avatar based on the tutor ID */}
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.id}`} alt="Avatar" className="w-16 h-16 rounded-full bg-slate-700" />
                    <div>
                      <h3 className="text-xl font-bold">{tutor.subject}</h3> 
                      {/* Note: We are showing Subject as name for now because 'tutors' table links to 'profiles', but let's keep it simple */}
                      <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                        <Star size={14} fill="currentColor" /> {tutor.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-white">R{tutor.price_per_hour}</span>
                    <span className="text-slate-400 text-xs">per hour</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-slate-300 font-medium mb-2 text-sm line-clamp-2">{tutor.bio}</p>
                  <div className="flex gap-2 flex-wrap">
                    {tutor.tags && tutor.tags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded-md border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition group-hover:shadow-lg group-hover:shadow-blue-600/20">
                  <Clock size={18} />
                  Book Session
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTutors.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>No tutors found. Try searching for something else.</p>
          </div>
        )}
      </main>
    </div>
  );
}