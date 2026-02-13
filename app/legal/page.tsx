import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-white mb-8 hover:underline">
           <ArrowLeft size={16} /> Back Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">Terms & Refund Policy</h1>
        
        <div className="space-y-6">
           <section>
              <h2 className="text-xl font-bold text-white mb-2">1. Booking & Payments</h2>
              <p>When you book a session, payment is processed immediately via Paystack. Funds are held in escrow until the session is completed or disputed.</p>
           </section>

           <section>
              <h2 className="text-xl font-bold text-white mb-2">2. Cancellations & Refunds</h2>
              <ul className="list-disc pl-5 space-y-2">
                 <li><strong>Student Cancellation:</strong> You may cancel up to 1 hour before the session for a full refund (minus processing fees). Refunds take 3-7 business days to reflect in your bank account.</li>
                 <li><strong>Tutor Cancellation:</strong> If a tutor cancels or does not show up, you are entitled to a full refund.</li>
                 <li><strong>"No Show":</strong> If you (the student) do not show up for the session within 15 minutes, the tutor may mark the session as complete, and 50% refund will be issued.</li>
              </ul>
           </section>

           <section>
              <h2 className="text-xl font-bold text-white mb-2">3. Code of Conduct</h2>
              <p>Tutbuddy is a professional learning platform. Harassment, inappropriate behavior, or attempts to bypass the payment system will result in an immediate permanent ban.</p>
           </section>

           <section>
              <h2 className="text-xl font-bold text-white mb-2">4. Disclaimer</h2>
              <p>Tutbuddy connects students with independent tutors. We do not employ tutors directly and are not responsible for the content of their lessons. However, we verify academic transcripts to ensure quality.</p>
           </section>
        </div>
        
        <div className="mt-12 border-t border-slate-700 pt-6 text-sm">
           <p>Contact Support: tutbuddy0@gmail.com</p>
        </div>
      </div>
    </div>
  );
}