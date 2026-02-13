'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, User, GraduationCap, School, Languages, Eye, EyeOff, BookOpen, Linkedin } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Tutor Fields
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [languageStr, setLanguageStr] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [aboutMe, setAboutMe] = useState(''); // NEW: Replaces the 3 questions

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email first.", type: 'error' });
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
        
        // 1. Prepare Metadata
        const metaData = {
          full_name: fullName,
          is_tutor: role === 'tutor',
          subject: subject,
          price: price,
          languages: languageStr,
          linkedin_link: linkedin,
          bio: aboutMe // Save "About Me" directly to bio
        };

        // 2. Send Signup
        const { error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`, 
            data: metaData
          }
        });

        if (authError) throw authError;

        setConfirmationSent(true);

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
      if (error.message === "Failed to fetch") setMessage({ text: "Network error. Check internet.", type: 'error' });
      else setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-10 rounded-3xl w-full max-w-md text-center shadow-2xl">
           <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-green-500" size={40} />
           </div>
           <h2 className="text-3xl font-bold text-white mb-4">Check Your Inbox</h2>
           <p className="text-slate-300 mb-8 leading-relaxed">
             We have sent a verification link to <span className="text-white font-bold">{email}</span>.
             <br/><br/>
             Please click the link to activate your account.
             <br/>
             <span className="text-xs text-slate-500">(Check Spam folder if you don't see it)</span>
           </p>
           <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white underline text-sm">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-10">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">Tut<span className="text-white">Buddy</span></h1>
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
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white focus:border-blue-500 outline-none [&::-ms-reveal]:hidden" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-white">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isSignUp && (
              <div className="text-right mt-2">
                <button type="button" onClick={handleResetPassword} className="text-slate-400 text-xs hover:text-white underline">Forgot Password?</button>
              </div>
            )}
          </div>

          {/* --- NEW TUTOR FORM (Simplified) --- */}
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
              
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2 flex items-center gap-1"><Linkedin size={14}/> LinkedIn (Optional)</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-yellow-400 outline-none" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </div>

              {/* NEW: ABOUT ME (Replaces the 3 Questions) */}
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2 flex items-center gap-1"><BookOpen size={14}/> About Me / Teaching Style</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-yellow-400 outline-none h-32" 
                  placeholder="Describe yourself, how you teach, and why students should pick you..." 
                  value={aboutMe} 
                  onChange={(e) => setAboutMe(e.target.value)}
                  required
                />
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