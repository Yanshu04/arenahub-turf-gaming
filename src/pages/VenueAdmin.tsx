/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/MockBookingContext';
import { VENUES } from '../lib/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, ArrowLeft, TrendingUp, Filter, 
  Settings, Image as ImageIcon, Sparkles, Save, Info, Plus, Minus,
  RotateCcw, Landmark, Zap, Compass, Star, MapPin
} from 'lucide-react';

const IMAGE_PRESETS = {
  turf: [
    { label: 'Stadium Floodlight', url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800' },
    { label: 'Precision Turf Pitch', url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Evening Arena', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' }
  ],
  gaming: [
    { label: 'Esports Battle Station', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Pro PS5 Console Zone', url: 'https://images.unsplash.com/photo-162464313914c-1d0722cc0191?auto=format&fit=crop&q=80&w=800' },
    { label: 'Cyber Neon Lounge', url: 'https://images.unsplash.com/photo-1548685913-fe6574abf1a5?auto=format&fit=crop&q=80&w=800' }
  ]
};

export default function VenueAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, venues, updateVenue, showToast } = useBooking();
  
  const venue = venues.find(v => v.id === id);
  const venueBookings = bookings.filter(b => b.venueId === id);

  if (!venue) return <div className="text-center py-20 font-bold text-red-500">Venue Not Found</div>;

  // Controlled states for editing - initialized with current values
  const [price, setPrice] = useState(venue.pricePerHour);
  const [description, setDescription] = useState(venue.description);
  const [imageUrl, setImageUrl] = useState(venue.image);
  
  // Track hasChanged to prompt or control states
  const isDirty = price !== venue.pricePerHour || description !== venue.description || imageUrl !== venue.image;

  // Keep state updated if venue ID switches
  useEffect(() => {
    setPrice(venue.pricePerHour);
    setDescription(venue.description);
    setImageUrl(venue.image);
  }, [venue.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || price <= 0) {
      showToast('Please enter a valid price greater than ₹0.');
      return;
    }
    if (!description.trim()) {
      showToast('Please enter a facility description.');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('Please enter a valid image URL.');
      return;
    }

    updateVenue(venue.id, {
      pricePerHour: Number(price),
      description: description.trim(),
      image: imageUrl.trim()
    });

    showToast(`Successfully updated details for ${venue.name}!`);
  };

  const handleResetDefaults = () => {
    const originalVenue = VENUES.find(v => v.id === id);
    if (originalVenue) {
      setPrice(originalVenue.pricePerHour);
      setDescription(originalVenue.description);
      setImageUrl(originalVenue.image);
      updateVenue(venue.id, {
        pricePerHour: originalVenue.pricePerHour,
        description: originalVenue.description,
        image: originalVenue.image
      });
      showToast('Reset facility details to original system defaults!');
    }
  };

  const currentPresets = IMAGE_PRESETS[venue.type === 'turf' ? 'turf' : 'gaming'];

  return (
    <div className="space-y-8">
      {/* Back and Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/partner')} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors shrink-0"
        >
          <ArrowLeft size={16} /> Back to Partner Hub
        </button>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50/50 px-3 py-1.5 border border-transparent hover:border-indigo-100"
        >
          <RotateCcw size={13} /> Reset Mock Defaults
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {venue.name} <span className="text-indigo-600">Console</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Update prices, visuals, and track bookings in real-time.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live: ACTIVE
           </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Reservations', value: venueBookings.length, icon: Calendar, color: 'indigo' },
          { label: 'Estimated Revenue', value: `₹${venueBookings.reduce((acc, b) => acc + b.totalAmount, 0)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Est. Facility Visitors', value: venueBookings.reduce((acc, b) => acc + (b.venueType === 'turf' ? 10 : 1), 0), icon: Users, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-black text-gray-450 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1 leading-none">{stat.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-2xl bg-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'amber'}-50 text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'amber'}-600 flex items-center justify-center border border-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'amber'}-100`}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Master Configuration Grid splits Layout in columns */}
      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* Column Left: Editor Engine (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Settings size={18} className="text-indigo-600" />
                Facility Settings
              </h2>
              {isDirty && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100">
                  Unsaved drafts
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Field 1: Price setter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Hourly Rate (₹/hr)</label>
                  <span className="text-xs font-bold text-indigo-600">₹{price}/hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setPrice(p => Math.max(0, p - 50))}
                    className="h-10 w-10 border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-gray-50 active:scale-90 transition-all shadow-sm bg-white font-bold"
                  >
                    <Minus size={14} />
                  </button>
                  <input 
                    type="number"
                    min="1"
                    max="10000"
                    value={price}
                    onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                    className="flex-1 h-10 border border-gray-100 rounded-xl text-center font-black text-gray-800 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setPrice(p => p + 50)}
                    className="h-10 w-10 border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-gray-50 active:scale-90 transition-all shadow-sm bg-white font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Field 2: Description text */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Facility Description</label>
                  <span className="text-[10px] font-semibold text-gray-400">{description.length}/160 chars</span>
                </div>
                <textarea 
                  rows={4}
                  maxLength={160}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insert attractive description pointing out target amenities..."
                  className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-100 p-3 rounded-2xl focus:border-indigo-500 focus:outline-none shadow-inner resize-none leading-relaxed"
                />
              </div>

              {/* Field 3: Custom Image with Preset quick chips */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">Facility Cover Photo</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ImageIcon size={14} />
                  </span>
                  <input 
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/your-image-source..."
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold text-gray-650 tracking-tight bg-white border border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none placeholder-gray-300"
                  />
                </div>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">SELECT COVER PRESET:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentPresets.map((preset, index) => {
                      const isActive = imageUrl === preset.url;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all select-none ${
                            isActive 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-sm' 
                              : 'bg-white border-gray-150 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Save Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isDirty}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all ${
                    isDirty 
                      ? 'bg-indigo-650 hover:bg-indigo-600 active:scale-95 shadow-indigo-100 hover:cursor-pointer' 
                      : 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500'
                  }`}
                >
                  <Save size={14} />
                  Publish Live Updates
                </button>
              </div>

            </form>
          </div>

          {/* Interactive WYSIWYG Preview Box */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
              <Zap size={14} className="animate-pulse" />
              Live Live Card Preview
            </h3>
            
            {/* Mock Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transition-all">
              <div className="aspect-video w-full overflow-hidden relative bg-slate-900">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover transition-opacity duration-300" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-700">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-3 right-3 rounded-full bg-slate-900/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-black text-yellow-400 flex items-center gap-0.5 shadow-sm">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  {venue.rating}
                </div>
              </div>

              <div className="p-4 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-white leading-none tracking-tight">{venue.name}</h4>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 mt-1 leading-none"><MapPin size={10} /> {venue.location}</span>
                  </div>
                  <span className={`rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                    venue.type === 'turf' ? 'bg-green-950/80 text-green-400 border border-green-900/50' : 'bg-purple-950/80 text-purple-400 border border-purple-900/50'
                  }`}>
                    {venue.type}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic line-clamp-2">
                  {description.trim() || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Hourly Fee</p>
                    <p className="text-base font-extrabold text-white leading-none">
                      ₹{price}<span className="text-[10px] font-normal text-slate-500"> / hr</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-xl leading-none">
                    Preview Mode
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Column Right: Bookings list (Span 3) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Filter size={18} className="text-indigo-600" />
                Confirmed Reservations
              </h2>
            </div>

            {venueBookings.length === 0 ? (
              <div className="p-20 text-center text-gray-400 flex-1 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3 border border-gray-100">
                  <Calendar size={20} />
                </div>
                <p className="font-extrabold text-xs uppercase tracking-widest text-gray-400 leading-none">NO CONFIRMED PASSES</p>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-snug">There are no bookings recorded to this facility yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-black text-gray-450 uppercase tracking-widest">Customer ID</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-450 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-450 uppercase tracking-widest">Time Slot</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-450 uppercase tracking-widest">Revenue</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-450 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 leading-none">
                    {venueBookings.map((booking, index) => (
                      <motion.tr 
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-950 uppercase tracking-wider select-all">{booking.userId}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{booking.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock size={13} className="text-indigo-400" />
                            <span className="font-extrabold text-indigo-700 uppercase tracking-widest">{booking.slot}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-black text-sm text-gray-950">
                          ₹{booking.totalAmount}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-600 uppercase border border-emerald-100">
                            Confirmed
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
