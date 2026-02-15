'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Calendar, DollarSign, Video, LogOut, Zap, Bell, Clock, Check, X as XIcon, Search, PlusCircle, Trash2, AlertCircle, GraduationCap, Copy, Users, ShieldCheck, Upload, Banknote, Star, RotateCcw } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tutorData, setTutorData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const router = useRouter();

  // --- BANK FORM STATE ---
  const [bankName, setBankName] = useState('Capitec Bank');
  const [accNumber, setAccNumber] = useState('');

  // RATING STATE
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  const BANKS = [
    { name: 'Capitec Bank', code: '470010' },
    { name: 'FNB', code: '250655' },
    { name: 'Standard Bank', code: '051001' },
    { name: 'Absa', code: '632005' },
    { name: 'Nedbank', code: '198765' },
    { name: 'TymeBank', code: '678910' }
  ];

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
        if(tData.bank_name) setBankName(tData.bank_name);
        if(tData.account_number) setAccNumber(tData.account_number);

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
    
    checkExpiredRefunds(fetchedBookings);

    // --- FILTER LOGIC (CLEAN DASHBOARD) ---
    const now = new Date();
    const cleanBookings = fetchedBookings.filter((b: any) => {
      
      // 1. Hide Cancelled immediately
      if (b.status === 'cancelled') return false;

      // 2. Rejected/No-Show Logic: Hide for Tutors instantly, keep for Students for 24 hours
      if (b.status === 'rejected') {
          if (profileData?.is_tutor) return false;
          const sessionTime = new Date(b.scheduled_time || b.created_at);
          const studentCutoff = new Date(sessionTime.getTime() + (24 * 60 * 60 * 1000));
          if (now > studentCutoff) return false;
      }
      
      // 3. Completed Logic: Hide for Tutors instantly, keep for Students for 24 hours to review
      if (b.status === 'completed') {
          if (profileData?.is_tutor) return false;
          const sessionTime = new Date(b.scheduled_time || b.created_at);
          const studentCutoff = new Date(sessionTime.getTime() + (24 * 60 * 60 * 1000));
          if (now > studentCutoff) return false;
      }

      // 4. Pending Expiry
      if (b.status === 'pending') {
         const bookingTime = new Date(b.scheduled_time || b.created_at);
         const expiryTime = b.booking_type === 'live' 
            ? new Date(new Date(b.created_at).getTime() + 15 * 60000) 
            : new Date(bookingTime.getTime() + 60 * 60000); 

         if (now > expiryTime) return false; 
      }

      // 5. Confirmed Expiry
      if (b.status === 'confirmed') {
         const scheduledTime = new Date(b.scheduled_time || b.created_at);
         const finishTime = new Date(scheduledTime.getTime() + 90 * 60000); 
         if (now > finishTime) return false;
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

  // --- ACTIONS ---

  const handleStudentNoShow = async (booking: any) => {
    if (!confirm("Confirm Student No-Show? This will end the session and refund the student 50% only.")) return;

    const totalCents = (tutorData?.price_per_hour || 150) * 100;
    const halfRefund = Math.floor(totalCents * 0.5);

    try {
        const res = await fetch('/api/paystack/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: booking.payment_intent_id, amount: halfRefund })
        });

        if (!res.ok) throw new Error("Paystack partial refund failed");

        await supabase.from('bookings').update({ 
            status: 'rejected', 
            payment_status: 'partial_refund',
            rejection_reason: 'no_show' 
        }).eq('id', booking.id);

        await supabase.from('reported_issues').insert([{
            booking_id: booking.id,
            student_id: booking.student_id,
            issue_description: 'Student No-Show (Penalty Applied)',
            status: 'resolved'
        }]);

        alert("Action processed. Student penalized 50%.");
        refreshData();
    } catch (err: any) {
        alert("Action failed: " + err.message);
    }
  };

  const checkExpiredRefunds = async (bookingsList: any[]) => {
    const now = new Date();
    bookingsList.forEach(async (b) => {
        if (b.status === 'pending' && b.payment_status === 'paid') {
            const createdTime = new Date(b.created_at);
            const scheduledTime = new Date(b.scheduled_time);
            let isExpired = false;

            if (b.booking_type === 'live') {
                if (now > new Date(createdTime.getTime() + 15 * 60000)) isExpired = true;
            } else {
                if (now > new Date(scheduledTime.getTime() + 120 * 60000)) isExpired = true;
            }

            if (isExpired) {
                await fetch('/api/paystack/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference: b.payment_intent_id })
                });
                await supabase.from('bookings').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', b.id);
            }
        }
    });
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!accNumber) return;
    const { error } = await supabase.from('tutors').update({
        bank_name: bankName,
        account_number: accNumber,
        payouts_enabled: true
    }).eq('id', tutorData.id);
    if(error) alert("Error saving: " + error.message);
    else { alert("Bank details saved!"); refreshData(); }
  };

  const handleTranscriptUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const fileExt = file.name.split('.').pop();
    const cleanName = profile.full_name.replace(/[^a-zA-Z0-9]/g, '_'); 
    const fileName = `${cleanName}-${tutorData.id}-transcript.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('transcripts').upload(filePath, file, { upsert: true });
    if (uploadError) { alert("Upload failed: " + uploadError.message); setUploadingFile(false); return; }
    await supabase.from('tutors').update({ verification_status: 'pending' }).eq('id', tutorData.id);
    alert("Transcript uploaded!");
    refreshData();
    setUploadingFile(false);
  };

  const toggleOnline = async () => {
    if (!tutorData) return;
    const newStatus = !tutorData.is_online;
    setTutorData({ ...tutorData, is_online: newStatus }); 
    const { error } = await supabase.from('tutors').update({ is_online: newStatus }).eq('id', tutorData.id);
    if (error) alert("Status update failed: " + error.message);
  };

  const handleBookingAction = async (booking: any, action: 'confirmed' | 'rejected') => {
    let link = null;
    let reason = null;

    if (action === 'confirmed') {
      const rawLink = prompt("Please enter Zoom/Google Meet link:");
      if (!rawLink) return; 
      link = rawLink.trim();
    } 
    
    if (action === 'rejected') {
      if (!confirm("Are you sure? This will refund the student.")) return;
      reason = "Tutor unavailable.";
      
      if (booking.payment_status === 'paid' && booking.payment_intent_id) {
          try {
             await fetch('/api/paystack/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: booking.payment_intent_id })
             });
             alert("Student has been refunded automatically.");
          } catch (err) {
             console.error("Refund failed", err);
          }
      }
    }

    await supabase.from('bookings').update({ status: action, meeting_link: link, rejection_reason: reason }).eq('id', booking.id);
    refreshData();
  };

  const handleCancelBooking = async (booking: any) => {
    const isRejected = booking.status === 'rejected';
    const msg = isRejected ? "Remove this notice from your dashboard?" : "Remove this booking? This will cancel the session.";
    
    if (confirm(msg)) {
        if (!isRejected && booking.payment_status === 'paid' && booking.payment_intent_id) {
            alert("Processing refund...");
            try {
                const res = await fetch('/api/paystack/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference: booking.payment_intent_id })
                });
                if (!res.ok) throw new Error("Refund API failed");
                alert("Refund initiated! Funds return in 3-5 days.");
            } catch (err: any) {
                alert("Refund failed: " + err.message);
                return;
            }
        }
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
      refreshData();
    }
  };

  const handleUploadClick = () => {
    const title = prompt("Enter Lesson Title:");
    const url = prompt("Enter YouTube Link:");
    if (title && url) uploadLesson(title, url);
  };

  const uploadLesson = async (title: string, url: string) => {
    const { error } = await supabase.from('lessons').insert([{ tutor_id: tutorData.user_id, title: title, video_url: url }]);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied! Send it to your group.");
  };

  const isNoShowEligible = (booking: any) => {
    if (booking.status !== 'confirmed') return false;
    const lessonTime = new Date(booking.scheduled_time || booking.created_at);
    const fifteenMinsLater = new Date(lessonTime.getTime() + 15 * 60000); 
    return new Date() > fifteenMinsLater; 
  };

  const isLessonFinished = (booking: any) => {
    if (booking.status !== 'confirmed') return false;
    const lessonTime = new Date(booking.scheduled_time || booking.created_at);
    const oneHourLater = new Date(lessonTime.getTime() + 60 * 60000); 
    return new Date() > oneHourLater; 
  };

  const submitReview = async () => {
    if (!ratingModal) return;
    const { error } = await supabase.from('reviews').insert([{
        tutor_id: ratingModal.tutor_id,
        student_id: profile.id,
        rating: stars,
        comment: comment
    }]);
    if (error) alert("Error: " + error.message);
    else {
        await supabase.from('bookings').update({ status: 'completed' }).eq('id', ratingModal.id);
        alert("Review Submitted!");
        setRatingModal(null);
        refreshData();
    }
  };

  const markComplete = async (bookingId: number) => {
      if(!confirm("Confirm lesson was successful? This will trigger your payout process.")) return;
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
      refreshData();
  };

  const reportIssue = async (bookingId: number) => {
      const issue = prompt("Please describe the issue (e.g. Tutor No Show):");
      if (issue) {
          await supabase.from('bookings').update({ status: 'disputed', rejection_reason: issue }).eq('id', bookingId);
          alert("Issue Reported. Support will contact you shortly.");
          refreshData();
      }
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
      
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="inline-block group cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20"><GraduationCap className="text-yellow-400" size={24} /></div>
            <h1 className="text-xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">TUT<span className="text-white">BUDDY</span></h1>
          </div>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-700 pb-6 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-yellow-400">{profile?.full_name?.[0] || 'U'}</div>
             <div><h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1><span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs uppercase font-bold border border-slate-700">{profile?.is_tutor ? 'Tutor Dashboard' : 'Student Dashboard'}</span></div>
          </div>
          <div className="flex items-center gap-4">
             {profile?.is_tutor && <button onClick={toggleOnline} className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg ${tutorData?.is_online ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}><Zap size={20}/>{tutorData?.is_online ? 'ONLINE' : 'OFFLINE'}</button>}
             <button onClick={() => window.location.reload()} className="bg-slate-800 p-3 rounded-full hover:bg-slate-700 text-slate-400" title="Refresh Data"><RotateCcw size={16}/></button>
             <button onClick={handleLogout} className="text-red-400 font-bold border border-slate-700 px-4 py-3 rounded-full"><LogOut size={16} /></button>
          </div>
        </div>

        {/* --- STATS GRID (MOVED TO TOP) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<Calendar />} label="Total Bookings" value={bookings.length} />
            {profile?.is_tutor ? (
               <>
                 <StatCard icon={<Check />} label="Confirmed Sessions" value={bookings.filter(b => b.status === 'confirmed').length} color="text-green-400" />
                 <StatCard icon={<DollarSign />} label="Potential Earnings" value={`R ${bookings.filter(b => b.status !== 'rejected').length * (tutorData?.price_per_hour || 0)}`} color="text-yellow-400" />
               </>
            ) : (
               <>
                 <StatCard icon={<Clock />} label="Pending" value={bookings.filter(b => b.status === 'pending').length} color="text-yellow-400" />
                 <StatCard icon={<Check />} label="Confirmed" value={bookings.filter(b => b.status === 'confirmed').length} color="text-green-400" />
               </>
            )}
        </div>

        {profile?.is_tutor && !tutorData?.payouts_enabled && (
           <div className="mb-6 bg-slate-800 border border-slate-700 p-6 rounded-2xl">
             <div className="flex items-center gap-2 mb-4 text-white"><Banknote className="text-green-400" /><h3 className="font-bold text-lg">Add Bank Details</h3></div>
             <form onSubmit={handleSaveBank} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full"><label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Bank Name</label><select className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={bankName} onChange={(e) => setBankName(e.target.value)}>{BANKS.map(b => <option key={b.code} value={b.name}>{b.name}</option>)}</select></div>
                <div className="w-full"><label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Account Number</label><input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="1234567890" value={accNumber} onChange={(e) => setAccNumber(e.target.value)} required /></div>
                <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl w-full md:w-auto">Save Details</button>
             </form>
           </div>
        )}

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="text-yellow-400" /> {profile?.is_tutor ? 'Manage Requests' : 'My Sessions'}</h2>
          
          <div className="space-y-4">
            {bookings.length === 0 ? <p className="text-slate-500 text-center py-8">No active bookings.</p> : bookings.map((booking) => (
                <div key={booking.id} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                   <div className="flex items-center gap-4 w-full">
                     <div className={`p-3 rounded-full shrink-0 ${booking.status === 'rejected' ? 'bg-red-500/20 text-red-400' : (booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400')}`}>
                        {booking.status === 'rejected' ? <XIcon size={24}/> : (booking.status === 'completed' ? <Check size={24}/> : <Clock size={24} />)}
                     </div>
                     <div className="w-full">
                       <h3 className="font-bold text-lg text-white">
                         {profile?.is_tutor 
                           ? `Student: ${booking.profiles?.full_name || 'Unknown'}` 
                           : `Tutor: ${booking.tutors?.profiles?.full_name || 'Unknown Tutor'}`
                         }
                       </h3>
                       
                       {/* DYNAMIC ALERT MESSAGES FOR STUDENTS */}
                       {!profile?.is_tutor && booking.status === 'rejected' && (
                         <div className="mt-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                           <p className="text-xs text-red-400 uppercase font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> {booking.rejection_reason === 'no_show' ? 'Student No-Show Penalty' : 'Session Declined'}</p>
                           <p className="text-sm text-red-200 italic">
                             {booking.rejection_reason === 'no_show' 
                               ? "You did not join the session within 15 minutes. As per our policy, a 50% penalty was applied and the remaining funds were refunded." 
                               : "The tutor is unavailable and you have been refunded for that specific booking."}
                           </p>
                         </div>
                       )}

                       <div className="text-slate-400 text-sm flex flex-col gap-1 mt-1">
                          {booking.booking_type === 'live' ? <span className="text-green-400 font-bold">⚡ Live Request</span> : <span>📅 {new Date(booking.scheduled_time || booking.created_at).toLocaleString()}</span>}
                          
                          {booking.status === 'confirmed' && booking.meeting_link && (
                            <div className="flex flex-col md:flex-row gap-2 mt-1">
                                <a href={ensureProtocol(booking.meeting_link)} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 w-fit animate-pulse"><Video size={16} /> JOIN CALL</a>
                                {!profile?.is_tutor && booking.guest_emails && <button onClick={() => copyToClipboard(ensureProtocol(booking.meeting_link))} className="bg-slate-700 text-white py-2 px-4 rounded-lg text-xs"><Copy size={16} /> Copy Link</button>}
                            </div>
                          )}

                          {/* DYNAMIC ACTION BUTTONS (BOTH STAY VISIBLE) */}
                          {booking.status === 'confirmed' && (
                             <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                {profile?.is_tutor ? (
                                   <div className="flex flex-col gap-3">
                                      {/* MARK COMPLETE SECTION */}
                                      <div>
                                        <p className="text-xs text-blue-200 font-bold mb-2 uppercase tracking-tight">Session Completion:</p>
                                        {isLessonFinished(booking) ? (
                                           <button onClick={() => markComplete(booking.id)} className="bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600">Mark Complete</button>
                                        ) : (
                                           <p className="text-[10px] text-slate-500 italic">"Mark Complete" button appears after 60 mins.</p>
                                        )}
                                      </div>

                                      {/* NO SHOW SECTION */}
                                      <div className="pt-3 border-t border-blue-500/10">
                                        <p className="text-xs text-orange-200 font-bold mb-2 uppercase tracking-tight">Attendance Issue:</p>
                                        {isNoShowEligible(booking) ? (
                                          <button onClick={() => handleStudentNoShow(booking)} className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-500/50 hover:bg-orange-500 hover:text-white transition">Student No-Show (50% Penalty)</button>
                                        ) : (
                                          <p className="text-[10px] text-slate-500 italic">"No-Show" button appears after 15 mins.</p>
                                        )}
                                      </div>
                                   </div>
                                ) : (
                                   isLessonFinished(booking) && (
                                      <div className="flex flex-col gap-2">
                                         <p className="text-xs text-blue-200 font-bold">Lesson finished?</p>
                                         <div className="flex gap-2">
                                           <button onClick={() => setRatingModal(booking)} className="bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg">Rate Tutor</button>
                                           <button onClick={() => reportIssue(booking.id)} className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/50">Report Issue</button>
                                         </div>
                                      </div>
                                   )
                                )}
                             </div>
                          )}
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                     {profile?.is_tutor && booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBookingAction(booking, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg"><Check size={20} /></button>
                          <button onClick={() => handleBookingAction(booking, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg"><XIcon size={20} /></button>
                        </div>
                     )}
                     {!profile?.is_tutor && (
                        <button 
                          onClick={() => handleCancelBooking(booking)} 
                          className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white p-2 rounded-lg transition" 
                          title={booking.status === 'rejected' ? "Remove Notice" : "Cancel & Refund"}
                        >
                          <Trash2 size={20} />
                        </button>
                     )}
                   </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* RATING MODAL */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">Rate Tutor</h3>
            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setStars(s)}><Star size={32} fill={s <= stars ? "#facc15" : "none"} className={s <= stars ? "text-yellow-400" : "text-slate-600"} /></button>
                ))}
            </div>
            <textarea className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white mb-4" placeholder="How was the lesson?" onChange={(e) => setComment(e.target.value)} />
            <button onClick={submitReview} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">Submit & Finish</button>
            <button onClick={() => setRatingModal(null)} className="mt-4 text-slate-500 text-xs hover:text-white">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-yellow-400" }: any) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  )
}