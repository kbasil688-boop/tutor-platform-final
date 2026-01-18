'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link
import { User, Calendar, DollarSign, Video, LogOut, Zap, Bell, Clock, Check, X as XIcon, Search, PlusCircle, Trash2, AlertCircle, GraduationCap } from 'lucide-react'; // Added GraduationCap

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tutorData, setTutorData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ensureProtocol = (url: string) => {
    if (!url) return '#';
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return `https://${cleanUrl}`;
    }
    return cleanUrl;
  };

  const refreshData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    let fetchedBookings = [];

    if (profileData?.is_tutor) {
      const { data: tData } = await supabase.from('tutors').select('*').eq('user_id', user.id).single();
      setTutorData(tData);

      if (tData) {
        const { data: bData } = await supabase.from('bookings').select('*').eq('tutor_id', tData.id);
        
        if (bData && bData.length > 0) {
           const studentIds = bData.map(b => b.student_id);
           const { data: students } = await supabase.from('profiles').select('id, full_name, email').in('id', studentIds);
           
           fetchedBookings = bData.map(booking => ({
             ...booking,
             profiles: students?.find(s => s.id === booking.student_id)
           }));
        }
      }

    } else {
      const { data: bData } = await supabase.from('bookings').select('*').eq('student_id', user.id);
      
      if (bData && bData.length > 0) {
        const tutorIds = bData.map(b => b.tutor_id);
        const { data: tutors } = await supabase.from('tutors').select('*').in('id', tutorIds);
        
        const tutorUserIds = tutors?.map(t => t.user_id) || [];
        const { data: tutorProfiles } = await supabase.from('profiles').select('id, full_name').in('id', tutorUserIds);

        fetchedBookings = bData.map(booking => {
          const tutor = tutors?.find(t => t.id === booking.tutor_id);
          const tutorProfile = tutorProfiles?.find(p => p.id === tutor?.user_id);
          return {
            ...booking,
            tutors: { ...tutor, profiles: tutorProfile }
          };
        });
      }
    }
    
    // FILTER LOGIC
    const now = new Date();
    const cleanBookings = fetchedBookings.filter((b: any) => {
      // NOTE: Hide rejected bookings for Tutor, keep for Student
      if (profileData?.is_tutor && b.status === 'rejected') return false; 
      
      if (b.status === 'pending') {
         const bookingTime = new Date(b.scheduled_time || b.created_at);
         const expiryTime = b.booking_type === 'live' 
            ? new Date(new Date(b.created_at).getTime() + 10 * 60000) // 10 mins for Live
            : bookingTime; 

         if (now > expiryTime) return false; 
      }
      return true;
    });

    cleanBookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBookings(cleanBookings);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [router]);

  const toggleOnline = async () => {
    if (!tutorData) return;
    const newStatus = !tutorData.is_online;
    setTutorData({ ...tutorData, is_online: newStatus }); 
    const { error } = await supabase.from('tutors').update({ is_online: newStatus }).eq('id', tutorData.id);
    if (error) alert("Status update failed: " + error.message);
  };

  // --- UPDATED: SILENT REJECTION ---
  const handleBookingAction = async (bookingId: number, action: 'confirmed' | 'rejected') => {
    let link = null;
    let reason = null;

    if (action === 'confirmed') {
      const rawLink = prompt("Please enter Zoom/Google Meet link:");
      if (!rawLink) return;
      link = rawLink.trim();
    } 
    
    // CHANGE: If rejected, we just set a default message silently
    if (action === 'rejected') {
      if (!confirm("Are you sure you want to reject this request?")) return;
      reason = "Tutor is currently unavailable."; // Default polite message
    }

    await supabase.from('bookings').update({ 
        status: action, 
        meeting_link: link,
        rejection_reason: reason 
    }).eq('id', bookingId);
    
    refreshData();
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (confirm("Remove this booking?")) {
      await supabase.from('bookings').delete().eq('id', bookingId);
      refreshData();
    }
  };

  const handleUploadClick = () => {
    const title = prompt("Enter Lesson Title:");
    const url = prompt("Enter YouTube Link:");
    if (title && url) uploadLesson(title, url);
  };

  const uploadLesson = async (title: string, url: string) => {
    const { error } = await supabase.from('lessons').insert([
        { tutor_id: tutorData.user_id, title: title, video_url: url }
    ]);
    if (error) alert("Error: " + error.message);
    else alert("Lesson Uploaded!");
  }

  const handleLogout = async () => {
    if (profile?.is_tutor && tutorData) {
      await supabase.from('tutors').update({ is_online: false }).eq('id', tutorData.id);
    }
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'rejected': return 'text-red-400 border-red-500/50 bg-red-500/10';
      default: return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      
      {/* BRAND HEADER (Logo) */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="inline-block group cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20 group-hover:border-yellow-400/50 transition">
              <GraduationCap className="text-yellow-400 group-hover:rotate-12 transition duration-300" size={24} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              TUTOR<span className="text-white">HUB</span>
            </h1>
          </div>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* User Info Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-700 pb-6 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-yellow-400">
               {profile?.full_name?.[0] || 'U'}
             </div>
             <div>
               <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
               <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs uppercase font-bold border border-slate-700">
                 {profile?.is_tutor ? 'Tutor Dashboard' : 'Student Dashboard'}
               </span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {profile?.is_tutor && (
               <button onClick={toggleOnline} className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg ${tutorData?.is_online ? 'bg-green-500 text-black hover:bg-green-400 shadow-green-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                 <Zap fill={tutorData?.is_online ? "black" : "currentColor"} size={20} />
                 {tutorData?.is_online ? 'ONLINE' : 'OFFLINE'}
               </button>
             )}
             <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition font-bold border border-slate-700 px-4 py-3 rounded-full hover:bg-slate-800">
               <LogOut size={16} />
             </button>
          </div>
        </div>

        <div className="mb-10">
            {profile?.is_tutor ? (
                <div className="flex gap-4">
                  <button onClick={handleUploadClick} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition">
                    <PlusCircle size={20} /> Upload New Lesson
                  </button>
                  <button onClick={() => router.push('/dashboard/edit-profile')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition">
                    <User size={20} /> Edit Profile
                  </button>
                </div>
            ) : (
                <button onClick={() => router.push('/find-tutor')} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-[1.02]">
                  <Search size={24} /> FIND A TUTOR NOW
                </button>
            )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="text-yellow-400" /> {profile?.is_tutor ? 'Manage Requests' : 'My Sessions'}
          </h2>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No active bookings.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                   <div className="flex items-center gap-4 w-full">
                     <div className={`p-3 rounded-full shrink-0 ${booking.status === 'rejected' ? 'bg-red-500/20 text-red-400' : (booking.booking_type === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400')}`}>
                        {booking.status === 'rejected' ? <XIcon size={24}/> : (booking.booking_type === 'live' ? <Zap size={24} /> : <Clock size={24} />)}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-white">
                         {profile?.is_tutor 
                           ? `Student: ${booking.profiles?.full_name || 'Unknown'}` 
                           : `Tutor: ${booking.tutors?.profiles?.full_name || 'Unknown Tutor'}`
                         }
                       </h3>
                       
                       {profile?.is_tutor && booking.guest_emails && (
                         <div className="mt-1 bg-blue-500/10 border border-blue-500/30 p-2 rounded-lg">
                           <p className="text-xs text-blue-300 font-bold mb-1">📢 Group Session (+ Guests):</p>
                           <p className="text-xs text-slate-300 break-all">{booking.guest_emails}</p>
                         </div>
                       )}

                       {booking.topic_description && (
                         <div className="mt-2 mb-2 bg-slate-800 p-3 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Topic Request:</p>
                            <p className="text-sm text-white italic">"{booking.topic_description}"</p>
                         </div>
                       )}

                       {booking.status === 'rejected' && booking.rejection_reason && (
                         <div className="mt-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                            <p className="text-xs text-red-400 uppercase font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Session Declined:</p>
                            <p className="text-sm text-red-200">"{booking.rejection_reason}"</p>
                         </div>
                       )}

                       <div className="text-slate-400 text-sm flex flex-col gap-1 mt-1">
                          {booking.booking_type === 'live' ? (
                            <span className="text-green-400 font-bold">⚡ Live Request</span>
                          ) : (
                            <span>📅 {new Date(booking.scheduled_time || booking.created_at).toLocaleString()}</span>
                          )}
                          {booking.meeting_link && (
                            <div className="flex flex-col gap-1 mt-1">
                                <a href={ensureProtocol(booking.meeting_link)} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 w-fit animate-pulse">
                                   <Video size={16} /> JOIN CALL
                                </a>
                            </div>
                          )}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                       {booking.status}
                     </span>
                     {profile?.is_tutor && booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBookingAction(booking.id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg" title="Accept"><Check size={20} /></button>
                          <button onClick={() => handleBookingAction(booking.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg" title="Reject"><XIcon size={20} /></button>
                        </div>
                     )}
                     {!profile?.is_tutor && (
                        <button onClick={() => handleCancelBooking(booking.id)} className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white p-2 rounded-lg transition" title="Remove Booking">
                           <Trash2 size={20} />
                        </button>
                     )}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}