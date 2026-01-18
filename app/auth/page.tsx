'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, User, GraduationCap, School, CheckSquare, Languages } from 'lucide-react';

const PRESET_QUESTIONS = [
  "What is your 'Superpower' as a tutor?",
  "Describe your teaching style in 3 words.",
  "How do you simplify a topic that a student is completely stuck on?",
  "What can a student expect to achieve after their first 5 sessions with you?",
  "Give us a fun fact about you."
];

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [languageStr, setLanguageStr] = useState('');
  
  // Q&A
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});

  const toggleQuestion = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
      const newAnswers = { ...answers };
      delete newAnswers[index];
      setAnswers(newAnswers);
    } else {
      if (selectedIndices.length < 3) setSelectedIndices([...selectedIndices, index]);
      else alert("You can only choose 3 questions!");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email address first.", type: 'error' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) setMessage({ text: error.message, type: 'error' });
    else setMessage({ text: "Check your email for the reset link!", type: 'success' });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        if (role === 'tutor' && selectedIndices.length !== 3) {
          throw new Error("Please select and answer exactly 3 profile questions.");
        }

        // 1. PREPARE DATA (Pack the Suitcase)
        const formattedQA = selectedIndices.map(index => ({
          question: PRESET_QUESTIONS[index],
          answer: answers[index]
        }));

        const metaData = {
          full_name: fullName,
          is_tutor: role === 'tutor',
          subject: subject,
          price: price,
          languages: languageStr,
          custom_questions: formattedQA
        };

        // 2. SEND SIGNUP (Let Database handle creation after email confirm)
        const { error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`, // Go back to login page
            data: metaData // Sending the data safely
          }
        });

        if (authError) throw authError;

        setMessage({ text: "Success! Please check your email to confirm your account.", type: 'success' });

      } else {
        // === LOGIN ===
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            if (error.message.includes("Invalid login")) throw new Error("Invalid email or password.");
            else if (error.message.includes("Email not confirmed")) throw new Error("Please verify your email first.");
            else throw error;
        }

        if (data.user) {
           await supabase.from('tutors').update({ is_online: true }).eq('user_id', data.user.id);
        }
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.message === "Failed to fetch") setMessage({ text: "Network error.", type: 'error' });
      else setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-10">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">{isSignUp ? 'Join TutorHub' : 'Welcome Back'}</h1>
          <p className="text-slate-400">{isSignUp ? 'Create your profile.' : 'Login to your account.'}</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div onClick={() => setRole('student')} className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition ${role === 'student' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                <GraduationCap /> <span className="font-bold text-sm">Student</span>
              </div>
              <div onClick={() => setRole('tutor')} className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition ${role === 'tutor' ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                <School /> <span className="font-bold text-sm">Tutor</span>
              </div>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="email" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="you@university.ac.za" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="password" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {!isSignUp && (
              <div className="text-right mt-2">
                <button type="button" onClick={handleResetPassword} className="text-slate-400 text-xs hover:text-white underline">Forgot Password?</button>
              </div>
            )}
          </div>

          {isSignUp && role === 'tutor' && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <p className="text-yellow-400 text-sm font-bold text-center">Build Profile</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Subject</label>
                    <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-yellow-400 outline-none" placeholder="e.g. Calculus" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Rate (R/hr)</label>
                    <input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-yellow-400 outline-none" placeholder="150" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2 flex items-center gap-1"><Languages size={14}/> Languages (Comma separated)</label>
                <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-yellow-400 outline-none" placeholder="e.g. English, Zulu, Xhosa" value={languageStr} onChange={(e) => setLanguageStr(e.target.value)} />
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <p className="text-white text-xs font-bold mb-4 flex items-center justify-between">
                   <span>Select 3 Questions to Answer:</span>
                   <span className={selectedIndices.length === 3 ? "text-green-400" : "text-slate-500"}>{selectedIndices.length}/3</span>
                </p>
                <div className="space-y-3">
                  {PRESET_QUESTIONS.map((q, index) => (
                    <div key={index} className="space-y-2">
                      <div onClick={() => toggleQuestion(index)} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition ${selectedIndices.includes(index) ? 'bg-blue-900/30' : 'hover:bg-slate-800'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${selectedIndices.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                          {selectedIndices.includes(index) && <CheckSquare size={10} className="text-white"/>}
                        </div>
                        <span className={`text-xs ${selectedIndices.includes(index) ? 'text-white font-bold' : 'text-slate-400'}`}>{q}</span>
                      </div>
                      {selectedIndices.includes(index) && (
                        <textarea className="w-full bg-black/20 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-16 ml-7 w-[calc(100%-1.75rem)]" placeholder="Type your answer here..." value={answers[index] || ''} onChange={(e) => setAnswers({...answers, [index]: e.target.value})} required />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button disabled={loading} className={`w-full font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-6 ${isSignUp && role === 'tutor' ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? (role === 'tutor' ? 'Register' : 'Register') : 'Login')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-slate-400 text-sm hover:text-white transition underline">
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}