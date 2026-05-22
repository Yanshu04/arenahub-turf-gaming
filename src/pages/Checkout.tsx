/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/MockBookingContext';
import { useAuth } from '../context/MockAuthContext';
import { motion } from 'motion/react';
import { CreditCard, Wallet, Smartphone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Checkout() {
  const { pendingBooking, addBooking, clearPending, showToast } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [specialRequests, setSpecialRequests] = useState('');

  if (!pendingBooking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-gray-400"><Smartphone size={48} /></div>
        <h2 className="text-2xl font-bold">No active session</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold hover:underline">Return Home</button>
      </div>
    );
  }

  const handlePayment = () => {
    setIsProcessing(true);
    // Mimic API delay
    setTimeout(() => {
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'guest',
        venueId: pendingBooking.venueId!,
        venueName: pendingBooking.venueName!,
        venueType: pendingBooking.venueType!,
        slot: pendingBooking.slot!,
        date: pendingBooking.date!,
        totalAmount: pendingBooking.totalAmount!,
        status: 'confirmed' as const,
        specialRequests: specialRequests.trim() || undefined,
        isMultiPass: pendingBooking.isMultiPass,
        multiSlots: pendingBooking.multiSlots
      };
      
      addBooking(newBooking);
      clearPending();
      setIsProcessing(false);
      showToast(pendingBooking.isMultiPass ? 'Multi-Pass Bookings Confirmed!' : 'Booking Successful!');
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Slots
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900">Finish Your Booking</h1>
        <p className="mt-2 text-gray-500 font-medium">Safe and secure payment protected by 256-bit SSL encryption.</p>
      </div>

      <div className="grid gap-8">
        {/* Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-50 pb-6 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Booking At</p>
              <h2 className="text-xl font-bold text-gray-900">{pendingBooking.venueName}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Fee</p>
              <p className="text-2xl font-black text-indigo-600 leading-none">₹{pendingBooking.totalAmount}</p>
            </div>
          </div>

          {pendingBooking.isMultiPass && pendingBooking.multiSlots ? (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Booked Multi-Pass Sessions ({pendingBooking.multiSlots.length})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingBooking.multiSlots.map((item, idx) => (
                  <div key={idx} className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pass #{idx + 1}</p>
                    <p className="text-xs font-black text-gray-800 uppercase tracking-widest mt-1">
                      {item.dateStr.includes(',') ? item.dateStr.split(',')[1].trim() : item.dateStr}
                    </p>
                    <p className="text-sm font-extrabold text-indigo-650 mt-0.5">{item.slot}</p>
                    <div className="mt-3 text-[9px] font-black uppercase text-indigo-700 tracking-wider">
                      Rate: ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date</p>
                <p className="text-sm font-bold text-gray-900">{pendingBooking.date}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Slot</p>
                <p className="text-sm font-bold text-indigo-600">{pendingBooking.slot}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Notes/Special Requests Text Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm space-y-4"
        >
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-650">Guest Setup Requests (Optional)</h3>
            <p className="mt-1 text-xs text-gray-400 font-bold tracking-tight">
              Let the staff know if you need bibs, specific DLCs, peripherals or seating setups.
            </p>
          </div>
          <textarea
            rows={3}
            maxLength={200}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="E.g., Please load Apex Legends; have 10 yellow bibs ready on side..."
            className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-150 focus:border-indigo-500 focus:bg-white rounded-2xl p-4 focus:outline-none shadow-inner leading-relaxed transition-all"
          />
        </motion.div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-2">Payment Methods</h3>
          <div className="grid gap-3">
             <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-600 font-black">UPI</div>
                   <div>
                      <p className="text-sm font-bold text-gray-900 tracking-tight">Mock UPI Payment</p>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">GPAY, PhonePe, Paytm</p>
                   </div>
                </div>
                <div className="h-6 w-6 rounded-full border-4 border-indigo-600 flex items-center justify-center">
                   <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                </div>
             </div>

             <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 bg-white opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400"><CreditCard /></div>
                   <div>
                      <p className="text-sm font-bold text-gray-900">Card Payment</p>
                      <p className="text-xs text-gray-500">Not enabled for demo</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 py-5 text-xl font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-80"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
               <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
               Securing Payment...
            </div>
          ) : (
            <span className="flex items-center gap-2">
               Complete Payment <ShieldCheck size={24} />
            </span>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 font-medium">
          Once confirmed, your digital entry pass will be available in the dashboard.
        </p>
      </div>
    </div>
  );
}
