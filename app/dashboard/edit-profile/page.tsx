'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Languages, Linkedin } from 'lucide-react'; // Added Linkedin

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tutorId, setTutorId] = useState<number | null>(null);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [bio, setBio] = useState('');
  const [languageStr, setLanguageStr] = useState(''); 
  const [linkedin, setLinkedin] = useState(''); // NEW: LinkedIn
  const [questions, setQuestions] = useState<any[]>([]);

  // 1. Fetch Current Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: tutor } = await supabase
        .from('tutors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (tutor) {
        setTutorId(tutor.id);
        setSubject(tutor.subject);
        setPrice(tutor.price_per_hour);
        setBio(tutor.bio || '');
        setLanguageStr(tutor.languages || ''); 
        setLinkedin(tutor.linkedin_link || ''); // Load LinkedIn
        setQuestions(Array.isArray(tutor.custom_questions) ? tutor.custom_questions : []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  // 2. Handle Question Edits
  const handleQuestionChange = (index: number, newAnswer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = newAnswer;
    setQuestions(updatedQuestions);
  };

  // 3. Save Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('tutors')
      .update({
        subject: subject,
        price_per_hour: parseInt(price),
        bio: bio,
        languages: languageStr,
        linkedin_link: linkedin, // Save LinkedIn
        custom_questions: questions
      })
      .eq('id', tutorId);

    setSaving(false);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Profile Updated Successfully!");
      router.push('/dashboard');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-2xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Subject</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Hourly Rate (R)</label>
              <input 
                type="number" 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* LANGUAGES */}
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2 flex items-center gap-1">
                <Languages size={14}/> Languages (Comma separated)
            </label>
            <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                placeholder="English, Zulu, Xhosa"
                value={languageStr}
                onChange={(e) => setLanguageStr(e.target.value)}
            />
          </div>

          {/* LINKEDIN (NEW) */}
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2 flex items-center gap-1">
                <Linkedin size={14}/> LinkedIn Profile Link
            </label>
            <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                placeholder="https://linkedin.com/in/yourname"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Short Bio</label>
            <textarea 
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none h-24"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {questions.length > 0 && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-yellow-400 font-bold mb-4">Edit Your Profile Answers</h3>
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={index}>
                    <p className="text-xs text-slate-400 mb-2 font-bold">{q.question}</p>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                      value={q.answer}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
          </button>

        </form>
      </div>
    </div>
  );
}