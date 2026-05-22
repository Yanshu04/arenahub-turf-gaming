/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/MockBookingContext';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, ArrowRight, Eye, Briefcase, 
  Calendar, Hourglass, Clock, Percent, Sparkles, Activity, IndianRupee, TrendingUp, BarChart2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const getVenueAnalytics = (venueId: string, venueType: 'turf' | 'gaming') => {
  // Seed-based realistic analytics
  const baseAnalytics: Record<string, { avgDuration: string; peakHours: string; cancelRate: string }> = {
    t1: { avgDuration: "1.5 hrs", peakHours: "06:00 PM - 09:00 PM", cancelRate: "4.2%" },
    t2: { avgDuration: "2.0 hrs", peakHours: "07:00 PM - 10:00 PM", cancelRate: "6.8%" },
    g1: { avgDuration: "3.5 hrs", peakHours: "04:00 PM - 09:00 PM", cancelRate: "2.4%" },
    g2: { avgDuration: "2.5 hrs", peakHours: "03:00 PM - 07:00 PM", cancelRate: "5.1%" },
  };

  return baseAnalytics[venueId] || {
    avgDuration: venueType === 'turf' ? "1.5 hrs" : "3.0 hrs",
    peakHours: venueType === 'turf' ? "06:00 PM - 09:00 PM" : "04:00 PM - 08:00 PM",
    cancelRate: "4.5%"
  };
};

export default function PartnerDashboard() {
  const { bookings, venues } = useBooking();
  const [selectedChartVenue, setSelectedChartVenue] = useState<string>('all');

  // Calculates stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const averageTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const activeVenuesCount = venues.length;

  const getBookingHour = (slotStr: string): number => {
    const match = slotStr.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      return hour;
    }
    return 9; // Fallback
  };

  const barChartData = useMemo(() => {
    const hoursList = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM (which is 6 to 23)
    return hoursList.map(hour => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour;
      if (hour > 12) displayHour = hour - 12;
      const label = `${displayHour} ${ampm}`;
      
      const count = bookings.filter(b => {
        if (selectedChartVenue !== 'all' && b.venueId !== selectedChartVenue) return false;
        return getBookingHour(b.slot) === hour;
      }).length;
      
      return {
        hour,
        label,
        bookings: count
      };
    });
  }, [bookings, selectedChartVenue, venues]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Partner <span className="text-indigo-600">Hub</span></h1>
          <p className="mt-2 text-gray-500 font-medium">Overview of your facilities and reservation data.</p>
        </div>
        <div className="hidden sm:block">
           <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3">
              <Briefcase size={20} className="text-indigo-400" />
              <div className="text-left">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Market Share</p>
                 <p className="text-sm font-bold">100% (Local Hub)</p>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Card Summary Dashboard Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 flex items-center justify-between shadow-xs"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Bookings</span>
            <p className="text-3xl font-black text-gray-950 leading-none">{totalBookings}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Across all active arenas</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
            <Calendar size={20} />
          </div>
        </motion.div>

        {/* Total Revenue Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 flex items-center justify-between shadow-xs"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue</span>
            <p className="text-3xl font-black text-emerald-650 leading-none">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Real-time conversions</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
            <IndianRupee size={20} />
          </div>
        </motion.div>

        {/* Avg Ticket Value */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 flex items-center justify-between shadow-xs"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Average Booking Value</span>
            <p className="text-3xl font-black text-gray-950 leading-none">₹{averageTicket}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Mean rate per reservation</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
            <TrendingUp size={20} />
          </div>
        </motion.div>

        {/* Active Venues */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 flex items-center justify-between shadow-xs"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Managed Venues</span>
            <p className="text-3xl font-black text-indigo-650 leading-none">{activeVenuesCount}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide font-bold">Turf & PC arenas</p>
          </div>
          <div className="h-12 w-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
            <Activity size={20} />
          </div>
        </motion.div>
      </div>

      {/* Peak Booking Hours Bar Chart Component Detail */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-950 flex items-center gap-2.5">
              <BarChart2 size={24} className="text-indigo-600 animate-pulse" />
              Peak Booking Hours
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Hourly distribution analysis of reservations
            </p>
          </div>
          
          {/* Chart Venue Toggles */}
          <div className="flex flex-wrap gap-2 p-1 bg-gray-50/80 border border-gray-100 rounded-2xl select-none">
            <button
              onClick={() => setSelectedChartVenue('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                selectedChartVenue === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-405 text-gray-400 font-bold hover:text-gray-700'
              }`}
            >
              All Facilities
            </button>
            {venues.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedChartVenue(v.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                  selectedChartVenue === v.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-405 text-gray-400 font-bold hover:text-gray-700'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full pr-4 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900 text-white text-xs rounded-2xl p-3 shadow-xl border border-gray-800 space-y-1">
                        <p className="font-black text-gray-400 uppercase tracking-widest text-[9px]">Time Slot: {payload[0].payload.label}</p>
                        <p className="text-sm font-black">{payload[0].value} reservations booked</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.bookings > 0 ? '#4f46e5' : '#e2e8f0'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-8">
        {venues.map((venue, index) => {
          const count = bookings.filter(b => b.venueId === venue.id).length;
          const analytics = getVenueAnalytics(venue.id, venue.type as 'turf' | 'gaming');
          const isGaming = venue.type === 'gaming';
          
          return (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-200/80 hover:border-indigo-100 transition-all duration-355"
            >
              {/* Card Header with Status/Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                    <img src={venue.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-gray-950 tracking-tight">{venue.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                        isGaming ? 'bg-purple-50 text-purple-650 border border-purple-100' : 'bg-emerald-50 text-emerald-650 border border-emerald-100'
                      }`}>
                        {venue.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-100">
                        ID: {venue.id}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-450 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Status: Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-indigo-50/50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:hidden">Reservations</span>
                  <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5">
                    <span className="text-3xl font-black text-indigo-650 leading-none">{count}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none sm:mt-1">Active Passes</span>
                  </div>
                </div>
              </div>

              {/* Bento Stats Analytics Segment */}
              <div className="mt-8">
                <div className="flex items-center gap-1.5 mb-3.5">
                  <Activity size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Live Analytics Matrix</span>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50/60 p-4 border border-gray-100/60 hover:bg-white hover:shadow-md hover:border-indigo-150/40 transition-all duration-300 group/tile flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Avg Duration</p>
                      <p className="text-lg font-black text-gray-900 leading-none">{analytics.avgDuration}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                      <Hourglass size={16} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50/60 p-4 border border-gray-100/60 hover:bg-white hover:shadow-md hover:border-indigo-150/40 transition-all duration-300 group/tile flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Peak Hours</p>
                      <p className="text-xs font-extrabold text-gray-950 uppercase tracking-tight leading-none pt-0.5">{analytics.peakHours}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                      <Clock size={16} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50/60 p-4 border border-gray-100/60 hover:bg-white hover:shadow-md hover:border-indigo-150/40 transition-all duration-300 group/tile flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Cancel Rate</p>
                      <p className="text-lg font-black text-emerald-600 leading-none">{analytics.cancelRate}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Percent size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 border-t border-gray-50 pt-6">
                <Link
                  to={`/venue/${venue.id}/admin`}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gray-950 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-gray-100 hover:shadow-indigo-50 transition-all hover:bg-indigo-650 active:scale-95"
                >
                  <Eye size={15} /> 
                  Open Operations Center
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
