import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, BookOpen, Clock, Users, PenTool } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-white mb-8 hover:underline">
           <ArrowLeft size={16} /> Back Home
        </Link>

        <h1 className="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-10">Last updated: February 2026</p>
        
        <div className="space-y-12">
           
           {/* --- SECTION A: FOR STUDENTS --- */}
           <section className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-blue-400"/> Student Policies
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">1. Booking & Payments</h3>
                  <p>All sessions are paid for upfront via Paystack. Your funds are held in a secure escrow account and are only released to the tutor once the session is successfully conducted.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">2. Cancellations & Refunds</h3>
                  <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Student Cancellation:</strong> You can cancel your booking up to 1 hour before the start time for a full refund. Please note that bank processing times usually take 3-7 business days.</li>
                      <li><strong>Tutor No-Show:</strong> If your tutor fails to attend, you are entitled to an immediate full refund.</li>
                      <li><strong>Late Arrival:</strong> Tutors are only required to wait for 15 minutes. If you do not join within this window, the session will be marked as a "Student No-Show," and no refund will be issued.</li>
                  </ul>
                </div>
              </div>
           </section>

           {/* --- SECTION B: FOR TUTORS --- */}
           <section className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="text-yellow-400"/> Tutor Guidelines & Agreement
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">1. Direct Payment Prohibition</h3>
                  <p className="text-red-300 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <ShieldAlert size={18} className="inline mr-2 mb-1"/>
                    <strong>Platform Integrity:</strong> To protect both parties, all financial transactions must happen through TutBuddy. Asking a student for direct payment (Cash, eWallet, or EFT) or moving communication to private channels for billing is strictly forbidden.
                  </p>
                  <p className="mt-2 text-sm italic">Violation of this rule results in a permanent account ban and the immediate forfeiture of all unpaid earnings.</p>
                </div>

                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <PenTool size={18} className="text-blue-400" /> Recommended Equipment
                  </h3>
                  <p>To provide the highest quality of instruction, we strongly recommend that tutors use a <strong>stylus and tablet (or digital pen)</strong>. Being able to solve problems visually on a digital whiteboard is key to student success on TutBuddy.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">2. Payout Structure</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Service Fee:</strong> TutBuddy retains a 15% commission on every booking to maintain the platform and process secure payments.</li>
                    <li><strong>Payment Timing:</strong> To ensure session satisfaction and handle potential disputes, <strong>payouts are processed 3 days after the successful completion</strong> of a booking.</li>
                    <li><strong>Reliability:</strong> Frequent cancellations or missed sessions will result in the loss of your "Verified Tutor" badge.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">3. Engagement Standards</h3>
                  <p>TutBuddy promotes "Active Mentorship." Rather than just giving answers, tutors should guide students through the logic of the module. Always review the student's shared topics before the session begins to ensure you are fully prepared to lead.</p>
                </div>
              </div>
           </section>

           {/* --- SECTION C: GENERAL --- */}
           <section className="px-4">
              <h2 className="text-xl font-bold text-white mb-2">Disclaimer</h2>
              <p className="text-sm">TutBuddy connects students with independent tutors. We verify academic transcripts to ensure quality, but we do not employ tutors directly. We are not responsible for the content of lessons or technical issues outside our control (e.g., Load Shedding)</p>
           </section>
        </div>
        
        
      </div>
    </div>
  );
}