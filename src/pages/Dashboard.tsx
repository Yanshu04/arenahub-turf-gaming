/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useBooking } from '../context/MockBookingContext';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, CheckCircle, Calendar, Hash, ArrowRight, Trash2, Filter, History, Bell, BellRing, QrCode, Camera, Check, X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';

// Helper to parse date string ("Friday, 22 May 2026") and slot string ("09:00 AM") to dynamic Date
const getSlotDateTime = (dateStr: string, slotStr: string): Date => {
  const timeRegex = /(\d{2}):(\d{2})\s*(AM|PM)/i;
  const match = slotStr.match(timeRegex);
  
  let hours = 9;
  let minutes = 0;
  
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  let dateObj = new Date(dateStr);
  
  if (isNaN(dateObj.getTime())) {
    // Robust parsing backup for locales like "Thursday, 22 May 2026"
    try {
      const cleanStr = dateStr.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const parts = cleanStr.split(' ');
      
      let day = 1;
      let month = 0;
      let year = new Date().getFullYear();
      
      const monthMap: { [key: string]: number } = {
        jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
        apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
        aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
        nov: 10, november: 10, dec: 11, december: 11
      };
      
      for (const part of parts) {
        if (monthMap[part] !== undefined) {
          month = monthMap[part];
        } else if (/^\d{4}$/.test(part)) {
          year = parseInt(part, 10);
        } else if (/^\d{1,2}$/.test(part)) {
          day = parseInt(part, 10);
        }
      }
      
      dateObj = new Date(year, month, day);
    } catch (e) {
      dateObj = new Date();
    }
  }
  
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
};

const getBookingStatusInfo = (bookingDateStr: string, slotStr: string) => {
  const slotStart = getSlotDateTime(bookingDateStr, slotStr);
  const now = new Date();
  
  // Custom slots are generally 1 hour sessions
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
  
  if (now > slotEnd) {
    return {
      status: 'Completed',
      label: 'Completed',
      colorClass: 'bg-gray-100 text-gray-500 border-gray-200/60',
      dotClass: 'bg-gray-400',
      isPast: true
    };
  } else if (now >= slotStart && now <= slotEnd) {
    return {
      status: 'In Progress',
      label: 'In Progress',
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
      dotClass: 'bg-emerald-500',
      isPast: false
    };
  } else {
    return {
      status: 'Active',
      label: 'Active Pass',
      colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotClass: 'bg-indigo-500',
      isPast: false
    };
  }
};

export default function Dashboard() {
  const { bookings, cancelBooking, showToast } = useBooking();
  const [filterVenueId, setFilterVenueId] = useState<string>('all');

  // Reminders configurations: key is bookingId
  const [reminders, setReminders] = useState<Record<string, { enabled: boolean; hours: number }>>(() => {
    try {
      const saved = localStorage.getItem('booking_reminders');
      return saved ? JSON.parse(saved) : {
        // Sample standard seed to make it highly visual out of the box for the tester!
        'all': { enabled: true, hours: 3 }
      };
    } catch (e) {
      return {};
    }
  });

  const saveReminders = (newRems: typeof reminders) => {
    setReminders(newRems);
    localStorage.setItem('booking_reminders', JSON.stringify(newRems));
  };

  // Checked-In Bookings List via QR Portals:
  const [checkedInIds, setCheckedInIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('checked_in_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const markCheckedIn = (bookingId: string) => {
    const updated = [...checkedInIds, bookingId];
    setCheckedInIds(updated);
    localStorage.setItem('checked_in_bookings', JSON.stringify(updated));
  };

  // Active scanning popup
  const [scanningBookingId, setScanningBookingId] = useState<string | null>(null);
  const [simulatedVideoState, setSimulatedVideoState] = useState<'idle' | 'focusing' | 'decoding' | 'success'>('idle');

  // Helper inside component to parse slot starting hours count
  const getHoursUntilSlot = (dateStr: string, slotStr: string): number => {
    const slotTime = getSlotDateTime(dateStr, slotStr);
    const now = new Date();
    const diffMs = slotTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const getCountdownString = (hoursUntil: number): string => {
    const totalMinutes = Math.floor(hoursUntil * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Derive unique venues from user bookings
  const uniqueVenues = useMemo(() => {
    const venuesMap = new Map<string, string>();
    bookings.forEach(b => {
      venuesMap.set(b.venueId, b.venueName);
    });
    return Array.from(venuesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const filteredBookings = filterVenueId === 'all' 
    ? bookings 
    : bookings.filter(b => b.venueId === filterVenueId);

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
      showToast('Booking cancelled successfully');
      // Reset filter if the last booking for that venue was cancelled
      const stillHasVenue = bookings.some(b => b.id !== id && b.venueId === filterVenueId);
      if (!stillHasVenue && filterVenueId !== 'all') {
        setFilterVenueId('all');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Booking History</h1>
          <p className="mt-2 text-gray-500 font-medium text-balance">Review your active passes and session history across all venues.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border border-indigo-100 shadow-sm">
           <CheckCircle size={18} /> Total Sessions: {bookings.length}
        </div>
      </div>

      {bookings.length > 0 && uniqueVenues.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterVenueId('all')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filterVenueId === 'all' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            All Venues
          </button>
          {uniqueVenues.map((venue) => (
            <button
              key={venue.id}
              onClick={() => setFilterVenueId(venue.id)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterVenueId === venue.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {venue.name}
            </button>
          ))}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center bg-white/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
            <Ticket size={32} />
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">No active bookings found</h2>
          <p className="mt-2 text-gray-500">Your upcoming turf sessions and gaming slots will appear here.</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 transition-all">
            Browse Venues <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => {
                const overrideCheckedIn = checkedInIds.includes(booking.id);
                const statusInfo = overrideCheckedIn 
                  ? {
                      status: 'Completed',
                      label: 'Scanned In',
                      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-250 font-black',
                      dotClass: 'bg-emerald-600',
                      isPast: true
                    }
                  : getBookingStatusInfo(booking.date, booking.slot);

                const hoursUntil = getHoursUntilSlot(booking.date, booking.slot);
                const isReminderEnabled = reminders[booking.id]?.enabled ?? true;
                const reminderHours = reminders[booking.id]?.hours ?? 3;
                const displayAlert = !statusInfo.isPast && hoursUntil > 0 && hoursUntil <= reminderHours && isReminderEnabled;

                return (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-6 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-100 hover:border-indigo-100/60"
                  >
                    {/* Subtle countdown alert block */}
                    {displayAlert && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-amber-50/70 border border-amber-200/60 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs gap-3 font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5 leading-none">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </span>
                          <span>
                            🔔 <span className="font-extrabold uppercase text-[9.5px] text-amber-700 tracking-wider mr-1">Upcoming Game Alarm:</span> Starting in <span className="text-amber-950 font-black text-sm bg-amber-100/60 px-1.5 py-0.5 rounded-lg">{getCountdownString(hoursUntil)}</span>. Arrive 10m early.
                          </span>
                        </div>
                        <span className="text-[8.5px] font-black uppercase text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.7 rounded shadow-inner tracking-widest hidden sm:inline-block">
                          PRIOR ALERT
                        </span>
                      </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                           <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                              booking.venueType === 'turf' ? 'bg-green-50 text-green-700 border border-green-200/40' : 'bg-purple-50 text-purple-700 border border-purple-200/40'
                           }`}>
                              {booking.venueType}
                           </span>
                           <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusInfo.colorClass}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass} ${statusInfo.status === 'In Progress' ? 'animate-ping' : ''}`}></span>
                              {statusInfo.status}
                           </span>
                           <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 select-none">
                              <Hash size={12} /> ID: {booking.id}
                           </span>
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{booking.venueName}</h3>

                        {booking.isMultiPass && booking.multiSlots ? (
                          <div className="space-y-2 mt-4 bg-gray-50/40 border border-gray-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Consolidated Passes ({booking.multiSlots.length})</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {booking.multiSlots.map((item, mIdx) => {
                                const passCheckedInKey = `${booking.id}_pass_${mIdx}`;
                                const wasPassCheckedIn = checkedInIds.includes(passCheckedInKey) || overrideCheckedIn;
                                const passStatus = wasPassCheckedIn 
                                  ? { 
                                      status: 'Completed',
                                      label: 'Scanned In', 
                                      colorClass: 'bg-emerald-50 text-emerald-750 border-emerald-150',
                                      dotClass: 'bg-emerald-500',
                                      isPast: true
                                    }
                                  : getBookingStatusInfo(item.dateStr, item.slot);
                                
                                return (
                                  <div key={mIdx} className="bg-white border border-gray-150/70 hover:border-indigo-100 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">Pass #{mIdx + 1}</span>
                                      <p className="text-xs font-black text-gray-800 uppercase tracking-widest mt-1">
                                        {item.dateStr.includes(',') ? item.dateStr.split(',')[1].trim() : item.dateStr}
                                      </p>
                                      <p className="text-xs font-extrabold text-indigo-600">{item.slot}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-lg ${
                                        wasPassCheckedIn 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 animate-fade' 
                                          : passStatus.colorClass
                                      }`}>
                                        {wasPassCheckedIn ? 'Checked-In' : passStatus.label}
                                      </span>
                                      
                                      {!wasPassCheckedIn && !overrideCheckedIn && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            markCheckedIn(passCheckedInKey);
                                            showToast(`Successfully checked in for pass #${mIdx + 1} (${item.slot})!`);
                                          }}
                                          className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-105 border border-indigo-100/50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Scan Pass
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-6 select-none">
                             <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                                   <Calendar size={16} />
                                </div>
                                <span className="text-xs font-extrabold text-gray-600">{booking.date}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                   <Ticket size={16} />
                                </div>
                                <span className="text-xs font-black text-indigo-650 uppercase tracking-widest bg-indigo-50/30 px-2 py-1 rounded-lg border border-indigo-100">{booking.slot}</span>
                             </div>
                          </div>
                        )}

                        {/* Booking Special requests output if exists */}
                        {booking.specialRequests && (
                          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 flex items-start gap-2 max-w-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 shadow-sm leading-none shrink-0 select-none">Notes</span>
                            <span className="text-xs font-bold italic text-gray-600 leading-relaxed">"{booking.specialRequests}"</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-10 text-center gap-3 self-center shrink-0">
                         <div className="space-y-1 select-none">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Paid Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">₹{booking.totalAmount}</p>
                         </div>

                         {/* Active Scan QR Button & Frame Verification */}
                         <button
                           type="button"
                           disabled={statusInfo.isPast}
                           onClick={() => {
                             setScanningBookingId(booking.id);
                             setSimulatedVideoState('idle');
                           }}
                           className={`group/qr relative h-24 w-24 rounded-3xl flex flex-col items-center justify-center border-4 border-gray-100 shadow-inner overflow-hidden transition-all duration-300 select-none ${
                             statusInfo.isPast 
                               ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                               : 'bg-gray-950 text-white cursor-pointer border-indigo-100 hover:border-indigo-400 hover:scale-105 active:scale-95 shadow-md'
                           }`}
                         >
                            {statusInfo.isPast ? (
                              <>
                                <CheckCircle className="text-emerald-500 scale-100" size={32} />
                                <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-400">
                                  VERIFIED
                                </span>
                              </>
                            ) : (
                              <>
                                <QrCode className="text-white group-hover/qr:scale-110 transition-transform" size={30} />
                                <span className="text-[8px] font-black tracking-widest uppercase mt-1.5 opacity-70 group-hover/qr:opacity-100">
                                  SCAN AT VENUE
                                </span>
                              </>
                            )}
                         </button>

                         <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 select-none ${
                            statusInfo.status === 'Completed' 
                              ? 'text-gray-400' 
                              : statusInfo.status === 'In Progress' 
                                ? 'text-emerald-600 font-extrabold' 
                                : 'text-indigo-650'
                         }`}>
                            <CheckCircle size={10} className={statusInfo.status === 'In Progress' ? 'animate-pulse' : ''} />
                            {statusInfo.label}
                         </span>
                         
                         {!statusInfo.isPast ? (
                            <button
                               onClick={() => handleCancel(booking.id)}
                               className="mt-1 text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                               <Trash2 size={12} /> Cancel Pass
                            </button>
                         ) : (
                            <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1 cursor-not-allowed select-none">
                               <History size={10} /> Checked-In
                            </span>
                         )}
                      </div>
                    </div>

                    {/* Alarm settings triggers panel for active booking */}
                    {!statusInfo.isPast && (
                      <div className="pt-4 border-t border-dashed border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-gray-50/50 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2.5 cursor-pointer text-[11px] font-extrabold text-gray-600 hover:text-gray-900 select-none">
                            <input
                              type="checkbox"
                              checked={isReminderEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const prev = reminders[booking.id] || { enabled: true, hours: 3 };
                                saveReminders({
                                  ...reminders,
                                  [booking.id]: { ...prev, enabled: checked }
                                });
                                showToast(checked ? 'Alert alarm reminders activated!' : 'Alarm reminder deactivated.');
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                            />
                            ⏰ Push reminders for this slot
                          </label>
                        </div>

                        {isReminderEnabled && (
                          <div className="flex items-center justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Alert Timing:</span>
                            <select
                              value={reminderHours}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const prev = reminders[booking.id] || { enabled: true, hours: 3 };
                                saveReminders({
                                  ...reminders,
                                  [booking.id]: { ...prev, hours: val }
                                });
                                showToast(`Alarm reminder timing configured to ${val} hours before starts!`);
                              }}
                              className="text-[10px] font-black text-indigo-750 bg-white border border-indigo-150/40 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer shadow-sm min-w-[120px]"
                            >
                              <option value="1">1 Hour Before</option>
                              <option value="2">2 Hours Before</option>
                              <option value="3">3 Hours Before</option>
                              <option value="5">5 Hours Before</option>
                              <option value="8">8 Hours Before</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Filter size={32} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">No bookings match this filter.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* State-of-the-art camera QR check-in scanner modal */}
      <AnimatePresence>
        {scanningBookingId && (() => {
          const targetBooking = bookings.find(b => b.id === scanningBookingId);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white"
            >
              <style>{`
                @keyframes scanlaser {
                  0% { top: 0%; opacity: 0.8; }
                  50% { top: 100%; opacity: 1; }
                  100% { top: 0%; opacity: 0.8; }
                }
                .scan-laser-line {
                  position: absolute;
                  left: 0;
                  width: 100%;
                  height: 3px;
                  background: #f43f5e;
                  box-shadow: 0 0 10px #f43f5e, 0 0 20px #f43f5e;
                  animation: scanlaser 2.5s ease-in-out infinite;
                }
              `}</style>

              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 15 }}
                className="bg-gray-900 border border-gray-850 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="text-rose-500 animate-pulse" size={20} />
                    <span className="font-black uppercase tracking-widest text-[10px] text-gray-300">
                      VenuScan™ Check-In Access Terminal
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setScanningBookingId(null);
                      setSimulatedVideoState('idle');
                    }}
                    className="p-1 px-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Subinfo */}
                <div className="space-y-1">
                  <h4 className="text-lg font-black tracking-tight">{targetBooking?.venueName}</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    VERIFYING SLOT: {targetBooking?.slot} • {targetBooking?.date}
                  </p>
                </div>

                {/* Viewfinder simulation viewport */}
                <div className="aspect-square relative rounded-2xl bg-gray-950 border-2 border-gray-800 overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Camera overlay items */}
                  <div className="absolute top-2.5 left-2.5 text-[8px] font-mono text-emerald-400 tracking-wider font-extrabold flex items-center gap-1.5 bg-black/65 px-2 py-0.5 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    LIVE REAR RECEPTACLE: HW_IDX_02
                  </div>
                  <div className="absolute top-2.5 right-2.5 text-[8px] font-mono text-gray-400 tracking-wider">
                    60 FPS / HD FEED
                  </div>

                  {/* Corner styling frame clips */}
                  <div className="absolute top-4 left-4 h-5 w-5 border-l-4 border-t-4 border-gray-600 rounded-tl-sm"></div>
                  <div className="absolute top-4 right-4 h-5 w-5 border-r-4 border-t-4 border-gray-600 rounded-tr-sm"></div>
                  <div className="absolute bottom-4 left-4 h-5 w-5 border-l-4 border-b-4 border-gray-600 rounded-bl-sm"></div>
                  <div className="absolute bottom-4 right-4 h-5 w-5 border-r-4 border-b-4 border-gray-600 rounded-br-sm"></div>

                  {simulatedVideoState === 'idle' && (
                    <div className="text-center space-y-4 px-4 flex flex-col items-center justify-center absolute inset-0 z-10 bg-black/40">
                      <QrCode size={54} className="text-gray-400 animate-pulse" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-gray-300">Awaiting Active Pass QR alignment</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1.5 max-w-xs leading-relaxed">
                          Position the checkout QR visual badge inside these green guides. Scanner will auto-validate.
                        </p>
                      </div>
                    </div>
                  )}

                  {simulatedVideoState === 'decoding' && (
                    <div className="text-center space-y-4 px-4 absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                      <div className="h-10 w-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400 animate-pulse">DECODING SECURE ENTRY SEED...</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Downloading public authorization signatures</p>
                      </div>
                    </div>
                  )}

                  {simulatedVideoState === 'success' && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-3 px-4 absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center z-30 text-emerald-100"
                    >
                      <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-400 animate-bounce">
                        <Check size={28} className="stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-emerald-400">PASS VERIFIED</p>
                        <p className="text-[10.5px] font-bold text-emerald-200 mt-1 uppercase tracking-tight">
                          Checked-In Successfully!
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Red Laser Overlay Line */}
                  {simulatedVideoState !== 'success' && (
                    <div className="scan-laser-line"></div>
                  )}
                </div>

                {/* Simulated action triggers */}
                {simulatedVideoState === 'idle' && (
                  <button
                    onClick={() => {
                      setSimulatedVideoState('decoding');
                      setTimeout(() => {
                        setSimulatedVideoState('success');
                        if (targetBooking) {
                          markCheckedIn(targetBooking.id);
                        }
                        showToast(`Pass verified! Welcome to ${targetBooking?.venueName}!`);
                        setTimeout(() => {
                          setScanningBookingId(null);
                          setSimulatedVideoState('idle');
                        }, 1800);
                      }, 1400);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <Camera size={14} /> Scan Pass QR Code
                  </button>
                )}

                {simulatedVideoState === 'decoding' && (
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-gray-850 text-gray-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed"
                  >
                    Validating active entry pass...
                  </button>
                )}

                {simulatedVideoState === 'success' && (
                  <div className="w-full py-4 rounded-2xl bg-emerald-850 text-emerald-200 font-black text-xs uppercase text-center tracking-widest border border-emerald-750">
                    ✓ Welcome guest player! Enjoy your slot.
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
