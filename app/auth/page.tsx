'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, User, GraduationCap, School } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  // State for form toggle
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Tutor Specific Fields
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');

  // --- PASSWORD RESET LOGIC ---
  // --- PASSWORD RESET LOGIC ---
 // --- PASSWORD RESET LOGIC ---
  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email address first.", type: 'error' });
      return;
    }
    setLoading(true);
    
    // UPDATED: Now points to the specific reset page
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    });
    
    setLoading(false);
    
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: "Check your email for the reset link!", type: 'success' });
    }
  };
    
    

  const handleAuth = async (e: React.FormEvent) =>{
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // --- 1. SIGN UP LOGIC ---
        
        // A. Create User in Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // B. Create the Profile Entry
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              is_tutor: role === 'tutor'
            }
          ]);

          if (profileError) throw profileError;

          // C. If Tutor, Create the Tutor Entry
          if (role === 'tutor') {
            const { error: tutorError } = await supabase.from('tutors').insert([
              {
                user_id: data.user.id,
                subject: subject,
                price_per_hour: parseInt(price),
                bio: `I am a new tutor teaching ${subject}.`,
                rating: 5.0,
                tags: [subject]
              }
            ]);
            if (tutorError) throw tutorError;
          }

          setMessage({ text: "Account created! Logging you in...", type: 'success' });
          router.push('/dashboard');
        }

      } else {
        // --- 2. LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setMessage({ text: error.message || "An error occurred", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {isSignUp ? 'Join TutorHub' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
            {isSignUp ? 'Start your learning journey today.' : 'Login to access your dashboard.'}
          </p>
        </div>

        {/* Error/Success Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* ROLE SELECTOR (Only show during Sign Up) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                onClick={() => setRole('student')}
                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition ${role === 'student' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <GraduationCap />
                <span className="font-bold text-sm">Student</span>
              </div>
              <div 
                onClick={() => setRole('tutor')}
                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition ${role === 'tutor' ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <School />
                <span className="font-bold text-sm">Tutor</span>
              </div>
            </div>
          )}

          {/* Full Name (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="you@university.ac.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* --- FORGOT PASSWORD BUTTON (New) --- */}
            {!isSignUp && (
              <div className="text-right mt-2">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-slate-400 text-xs hover:text-white underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {/* EXTRA TUTOR FIELDS */}
          {isSignUp && role === 'tutor' && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <p className="text-yellow-400 text-sm font-bold text-center">Tutor Details</p>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Subject you teach</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400 transition"
                  placeholder="e.g. Calculus, Java, Accounting"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Hourly Rate (R)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400 transition"
                  placeholder="e.g. 150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className={`w-full font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-6
              ${isSignUp && role === 'tutor' ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'}
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? (role === 'tutor' ? 'Register as Tutor' : 'Register as Student') : 'Login')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-400 text-sm hover:text-white transition underline"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}