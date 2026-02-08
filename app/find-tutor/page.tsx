'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Zap, Calendar, ArrowLeft, X, Video, User, RotateCcw, ExternalLink, MessageSquare, Languages, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack'; // 1. Import Paystack

export default function FindTutorPage() {
  const [guestEmails, setGuestEmails] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [bookingTutor, setBookingTutor] = useState<any>(null);
  const [profileTutor, setProfileTutor] = useState<any>(null);
  const [tutorLessons, setTutorLessons] = useState<any[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");

  // Payment State
  const [pendingBookingType, setPendingBookingType] = useState<'live' | 'scheduled' | null>(null);
  const [userEmail, setUserEmail] = useState("student@tutorhub.co.za");

  const router = useRouter();

  // 1. Fetch Tutors
  const fetchTutors = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tutors').select('*, profiles(full_name, avatar_url)');
    if (error) console.error(error);
    else setTutors(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTutors();
    // Get current user email for payment receipt
    supabase.auth.getUser().then(({data}) => {
       if(data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const handleViewProfile = async (tutor: any) => {
    setProfileTutor(tutor);
    const { data } = await supabase.from('lessons').select('*').eq('tutor_id', tutor.user_id);
    setTutorLessons(data || []);
  };

  // --- 2. PAYSTACK CONFIGURATION ---
  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: 15000, // R150.00 (in cents)
    currency: 'ZAR',
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '', 
  };

  // Initialize Hook
  const initializePayment = usePaystackPayment(config);

  // --- 3. PAYMENT SUCCESS HANDLER ---
  const onPaymentSuccess = async (reference: any) => {
    // Only run this IF payment worked
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('bookings').insert([
        { 
          student_id: user.id, 
          tutor_id: bookingTutor.id,
          status: 'pending', // Starts pending, Tutor must accept
          booking_type: pendingBookingType,
          scheduled_time: pendingBookingType === 'live' ? new Date().toISOString() : new Date(scheduleDate).toISOString(),
          guest_emails: guestEmails,
          topic_description: topicDescription,
          payment_status: 'paid', // Mark as Paid
          payment_intent_id: reference.reference // Save Paystack Ref
        }
      ]);

    if (error) {
      alert("Payment successful but Database error: " + error.message);
    } else {
      alert(pendingBookingType === 'live' ? "⚡ Payment Complete! Request Sent." : "📅 Payment Complete! Session Scheduled.");
      setBookingTutor(null);
      setGuestEmails(""); 
      setTopicDescription("");
      router.push('/dashboard');
    }
  };

  const onPaymentClose = () => {
    console.log("Payment closed by user");
  };

  // --- 4. TRIGGER PAYMENT ---
  // --- 4. TRIGGER PAYMENT ---
  const triggerBookingFlow = async (type: 'live' | 'scheduled') => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to book a tutor!");
      router.push('/auth');
      return;
    }

    // RULE 1: Topic is ALWAYS required
    if (!topicDescription.trim()) {
      alert("Please tell the tutor what you are struggling with!");
      return;
    }

    // RULE 2: Time is required ONLY for Scheduled sessions
    if (type === 'scheduled' && !scheduleDate) {
      alert("Please select a date and time for the session!");
      return;
    }

    // If validations pass, open Paystack
    setPendingBookingType(type);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  };


  const filteredTutors = tutors.filter(tutor => 
    tutor.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans relative">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20 group-hover:border-yellow-400/50 transition">
              <GraduationCap className="text-yellow-400 group-hover:rotate-12 transition duration-300" size={24} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Tut<span className="text-white">Buddy</span>
            </h1>
          </Link>
          
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Subject or Tutor Name..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full hover:bg-slate-700 text-slate-400 text-xs font-bold transition border border-slate-700"
          >
            <RotateCcw size={14} /> REFRESH LIST
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {loading ? (
          <div className="text-center text-slate-500 mt-20">Loading available tutors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <div key={tutor.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/30 transition group relative">
                
                {tutor.is_online && (
                  <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/30 animate-pulse">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> LIVE
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold border-2 border-slate-600">
                    {tutor.profiles?.full_name?.[0] || "T"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                       {tutor.profiles?.full_name || "Tutor"}
                       {tutor.verification_status === 'verified' && (
                          <ShieldCheck size={18} className="text-blue-400" fill="currentColor" stroke="black" />
                       )}
                    </h3>
                    <p className="text-slate-400 text-sm">{tutor.subject}</p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold mt-1">
                      <Star size={14} fill="currentColor" /> {tutor.rating}
                    </div>
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

                <div className="flex flex-col gap-2 border-t border-slate-700 pt-4">
                   <div className="flex justify-between items-center mb-2">
                      <span className="block text-2xl font-bold text-white">R{tutor.price_per_hour}</span>
                      <span className="text-slate-500 text-xs">per hour</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => handleViewProfile(tutor)}
                       className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition text-sm flex items-center justify-center gap-2"
                     >
                       <User size={16} /> Profile
                     </button>
                     <button 
                       onClick={() => setBookingTutor(tutor)}
                       className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition text-sm flex items-center justify-center gap-2"
                     >
                       <Clock size={16} /> Book
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- PROFILE & LESSONS MODAL --- */}
      {profileTutor && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 relative shadow-2xl">
            <button onClick={() => setProfileTutor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-slate-900 rounded-full"><X size={24} /></button>
            
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 border-b border-slate-700 pb-8">
                 <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold border-4 border-slate-600">
                    {profileTutor.profiles?.full_name?.[0]}
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        {profileTutor.profiles?.full_name}
                        {profileTutor.verification_status === 'verified' && <ShieldCheck size={24} className="text-blue-400" fill="currentColor" stroke="black" />}
                    </h2>
                    <p className="text-blue-400 font-bold text-lg">{profileTutor.subject}</p>
                    
                    {profileTutor.linkedin_link && (
                        <a href={profileTutor.linkedin_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-blue-300 hover:text-white transition bg-blue-900/30 px-2 py-1 rounded">
                            <ExternalLink size={12} /> LinkedIn Profile
                        </a>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Star size={12}/> {profileTutor.rating} Rating</span>
                       <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">R{profileTutor.price_per_hour}/hr</span>
                    </div>
                 </div>
              </div>

              {profileTutor.languages && (
                 <div className="mb-8">
                    <h3 className="text-slate-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                       <Languages size={14}/> I can speak/teach in these languages:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profileTutor.languages.split(',').map((lang: string, i: number) => (
                           <span key={i} className="bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-500/30">
                              {lang.trim()}
                           </span>
                        ))}
                    </div>
                 </div>
              )}

              <div className="mb-8 space-y-4">
                 <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={14}/> About {profileTutor.profiles?.full_name?.split(' ')[0]}
                 </h3>
                 
                 {Array.isArray(profileTutor.custom_questions) && profileTutor.custom_questions.length > 0 ? (
                    profileTutor.custom_questions.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                         <p className="text-yellow-400 font-bold text-sm mb-1">{item.question}</p>
                         <p className="text-slate-200 text-sm italic">"{item.answer}"</p>
                      </div>
                    ))
                 ) : (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                       <p className="text-slate-400 text-sm">{profileTutor.bio || "No detailed profile yet."}</p>
                    </div>
                 )}
              </div>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-t border-slate-700 pt-6">
                <Video className="text-yellow-400" /> Recorded Lessons
              </h3>
              
              <div className="space-y-3">
                 {tutorLessons.length === 0 ? (
                    <p className="text-slate-500 italic">No lessons yet.</p>
                 ) : (
                    tutorLessons.map((lesson) => (
                      <div key={lesson.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-950 transition">
                         <div className="flex items-center gap-3">
                            <Video className="text-slate-500" size={20} />
                            <div><h4 className="font-bold">{lesson.title}</h4></div>
                         </div>
                         <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                            <button className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                               <ExternalLink size={12} /> Watch
                            </button>
                         </a>
                      </div>
                    ))
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING & PAYMENT MODAL --- */}
      {bookingTutor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-[95%] md:w-full max-w-md rounded-3xl p-6 border border-slate-700 relative shadow-2xl">
            <button onClick={() => setBookingTutor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>

            <h2 className="text-2xl font-bold mb-1">Book {bookingTutor.profiles.full_name}</h2>
            <p className="text-slate-400 text-sm mb-6">Subject: {bookingTutor.subject}</p>
            <p className="text-yellow-400 font-bold mb-4">Price: R150.00 / session</p>

            <div className="space-y-4">
              
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                 <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">What are you struggling with?</label>
                 <textarea 
                   className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-20"
                   placeholder="e.g. I need help with Linear Algebra, specifically Eigenvalues..."
                   value={topicDescription}
                   onChange={(e) => setTopicDescription(e.target.value)}
                 />
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                 <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Group Session? (Max 4)</label>
                 <input 
                   type="text"
                   className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
                   placeholder="Enter friends' emails (separated by comma)"
                   value={guestEmails}
                   onChange={(e) => setGuestEmails(e.target.value)}
                 />
              </div>

              {/* PAYMENT TRIGGER BUTTONS */}
              <button 
                onClick={() => triggerBookingFlow('live')}
                disabled={!bookingTutor.is_online}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition
                  ${bookingTutor.is_online 
                    ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20 cursor-pointer' 
                    : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-full ${bookingTutor.is_online ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <div>
                    <span className={`block font-bold ${bookingTutor.is_online ? 'text-white' : 'text-slate-500'}`}>
                      {bookingTutor.is_online ? "Request Live (Pay R150)" : "Tutor is OFFLINE"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {bookingTutor.is_online ? "Instant Booking" : "Cannot book live right now"}
                    </span>
                  </div>
                </div>
              </button>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-blue-600 text-white"><Calendar size={20} /></div>
                    <span className="font-bold">Schedule for Later (Pay R150)</span>
                 </div>
                 <input type="datetime-local" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm mb-3" onChange={(e) => setScheduleDate(e.target.value)} />
                 <button onClick={() => triggerBookingFlow('scheduled')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition">Confirm & Pay</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}