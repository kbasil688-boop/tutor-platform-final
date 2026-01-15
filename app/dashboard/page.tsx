'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User, Calendar, DollarSign, Video, LogOut, Zap, Bell, Clock, Check, X as XIcon, Search, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tutorData, setTutorData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshData = async () => {
    console.log("🔄 Loading...");
    
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
      const { data: bData, error } = await supabase.from('bookings').select('*').eq('student_id', user.id);
      if (bData && bData.length > 0) {
        const tutorIds = bData.map(b => b.tutor_id);
        const { data: tutors } = await supabase.from('tutors').select('id, subject, price_per_hour, user_id').in('id', tutorIds);
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
    
    fetchedBookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBookings(fetchedBookings);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [router]);

  const toggleOnline = async () => {
    if (!tutorData) return;
    const newStatus = !tutorData.is_online;
    setTutorData({ ...tutorData, is_online: newStatus }); 
    await supabase.from('tutors').update({ is_online: newStatus }).eq('id', tutorData.id);
  };

  const handleBookingAction = async (bookingId: number, action: 'confirmed' | 'rejected') => {
    let link = null;
    if (action === 'confirmed') {
      link = prompt("Please enter the Zoom/Google Meet link for this session:");
      if (!link) return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: action, meeting_link: link })
      .eq('id', bookingId);

    if (error) alert("Error updating booking");
    else refreshData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
    if (error) alert("Error uploading: " + error.message);
    else alert("Lesson Uploaded!");
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'rejected': return 'text-red-400 border-red-500/50 bg-red-500/10';
      default: return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-700 pb-6 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-yellow-400">
               {profile?.full_name?.[0] || 'U'}
             </div>
             <div>
               <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
               <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs uppercase font-bold border border-slate-700">
                 {profile?.is_tutor ? 'Tutor Account' : 'Student Account'}
               </span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {profile?.is_tutor && (
               <button 
                 onClick={toggleOnline}
                 className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg
                   ${tutorData?.is_online 
                     ? 'bg-green-500 text-black hover:bg-green-400 shadow-green-500/20' 
                     : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
                 `}
               >
                 <Zap fill={tutorData?.is_online ? "black" : "currentColor"} size={20} />
                 {tutorData?.is_online ? 'ONLINE' : 'OFFLINE'}
               </button>
             )}
             <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition font-bold border border-slate-700 px-4 py-3 rounded-full hover:bg-slate-800">
               <LogOut size={16} />
             </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
            {profile?.is_tutor ? (
                <button onClick={handleUploadClick} className="w-full md:w-auto bg-blue-600 hover:bg-blue-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition">
                  <PlusCircle size={20} /> Upload New Lesson
                </button>
            ) : (
                <button onClick={() => router.push('/find-tutor')} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <Search size={24} /> FIND A TUTOR NOW
                </button>
            )}
        </div>

        {/* Bookings List */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="text-yellow-400" /> 
            {profile?.is_tutor ? 'Manage Requests' : 'My Session Status'}
          </h2>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No bookings found.</p>
            ) : (
              bookings
                .filter(b => b.status !== 'rejected')
                .map((booking) => (
                <div key={booking.id} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                   
                   <div className="flex items-center gap-4 w-full">
                     <div className={`p-3 rounded-full shrink-0 ${booking.booking_type === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {booking.booking_type === 'live' ? <Zap size={24} /> : <Clock size={24} />}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-white">
                         {profile?.is_tutor 
                           ? `Student: ${booking.profiles?.full_name || 'Unknown'}` 
                           : `Tutor: ${booking.tutors?.profiles?.full_name || 'Tutor'}`
                         }
                       </h3>
                       <p className="text-slate-400 text-sm flex items-center gap-2">
                         {booking.booking_type === 'live' ? (
                           <span className="text-green-400 font-bold">⚡ Live Request</span>
                         ) : (
                           <span>📅 {new Date(booking.scheduled_time || booking.created_at).toLocaleString()}</span>
                         )}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                     {/* JOIN CALL BUTTON */}
                     {booking.status === 'confirmed' && booking.meeting_link && (
                        <a 
                          href={booking.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-400 text-black text-xs font-black px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse whitespace-nowrap transition-all"
                        >
                          <Video size={14} fill="black" /> JOIN CALL
                        </a>
                      )}

                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                     </span>

                     {profile?.is_tutor && booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBookingAction(booking.id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition"><Check size={20} /></button>
                          <button onClick={() => handleBookingAction(booking.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition"><XIcon size={20} /></button>
                        </div>
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