/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Star, X, Info, ChevronRight, Navigation, 
  Trophy, Gamepad2, Layers, Compass, ArrowRight, IndianRupee
} from 'lucide-react';
import { Venue } from '../lib/mockData';

interface InteractiveMapProps {
  venues: Venue[];
}

interface MapCoords {
  x: number; // percentage
  y: number; // percentage
}

const DOCKED_VENUE_COORDS: Record<string, MapCoords> = {
  t1: { x: 30, y: 72 },   // Bandra West (near coast, bottom-ish)
  t2: { x: 55, y: 46 },   // Andheri East (center-east)
  g1: { x: 80, y: 32 },   // Powai (north-east near lake)
  g2: { x: 42, y: 58 },   // Vile Parle (west, near airport range)
};

const getVenueCoords = (venueId: string, index: number): MapCoords => {
  if (DOCKED_VENUE_COORDS[venueId]) {
    return DOCKED_VENUE_COORDS[venueId];
  }
  // Deterministic scattering fallback for newly added partner venues
  const scatterX = 25 + ((index * 23) % 55);
  const scatterY = 20 + ((index * 19) % 65);
  return { x: scatterX, y: scatterY };
};

export default function InteractiveMap({ venues }: InteractiveMapProps) {
  const [activeVenueId, setActiveVenueId] = useState<string | null>(venues[0]?.id || null);
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null);

  const activeVenue = useMemo(() => {
    return venues.find(v => v.id === activeVenueId) || venues[0] || null;
  }, [venues, activeVenueId]);

  return (
    <div className="grid gap-6 lg:grid-cols-4 bg-gray-50/40 p-4 rounded-3xl border border-gray-100">
      
      {/* Side Venue Navigation Tray */}
      <div className="lg:col-span-1 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
        <div className="p-3 bg-white border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-650 font-black text-[10px] uppercase tracking-widest">
            <Compass size={14} className="animate-spin-slow" />
            Interactive GPS Board
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">
            Hover or select a session hub to pinpoint its exact tactical location on the map grid.
          </p>
        </div>

        <div className="space-y-2 flex-1">
          {venues.map((venue, idx) => {
            const isActive = venue.id === activeVenueId;
            const isHovered = venue.id === hoveredVenueId;
            
            return (
              <motion.button
                key={venue.id}
                onClick={() => setActiveVenueId(venue.id)}
                onMouseEnter={() => setHoveredVenueId(venue.id)}
                onMouseLeave={() => setHoveredVenueId(null)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex gap-3 items-start select-none cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-150'
                    : isHovered
                    ? 'bg-white border-indigo-200 text-gray-900 shadow-md'
                    : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 shadow-sm'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`h-10 w-10 rounded-xl overflow-hidden shrink-0 border ${
                  isActive ? 'border-white/20' : 'border-gray-100'
                }`}>
                  <img src={venue.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-black truncate leading-tight uppercase tracking-tight">
                      {venue.name}
                    </h4>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                      isActive 
                        ? 'bg-white/15 text-white' 
                        : venue.type === 'turf' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {venue.type}
                    </span>
                  </div>
                  
                  <p className={`text-[10px] truncate mt-0.5 font-bold ${
                    isActive ? 'text-indigo-105' : 'text-gray-400'
                  }`}>
                    {venue.location}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-current/10">
                    <span className={`text-[10px] font-black ${
                      isActive ? 'text-white' : 'text-gray-950'
                    }`}>
                      ₹{venue.pricePerHour}/hr
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] font-black">
                      <Star size={9} className="fill-current" />
                      {venue.rating}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
          
          {venues.length === 0 && (
            <div className="p-8 text-center text-gray-400 bg-white border border-gray-150 rounded-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">No sites filtered</span>
              <p className="text-[11px] text-gray-500">Adjust the filters above to populate map markers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Map View Canvas Grid */}
      <div className="lg:col-span-3 relative h-[380px] sm:h-[480px] lg:h-[500px] w-full bg-slate-900 rounded-3xl border border-slate-950 shadow-2xl overflow-hidden group">
        
        {/* Styled Technical Coordinates Background Grid Grid Layer */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-60"></div>
        
        {/* Subtle Map HUD Lines & Labels */}
        <div className="absolute inset-4 border border-slate-800/40 pointer-events-none z-10 flex flex-col justify-between">
          <div className="flex justify-between p-2">
            <span className="font-mono text-[9px] text-slate-500 select-none tracking-widest leading-none">GPS LAT MAP TRACER // R.ACTIVE</span>
            <span className="font-mono text-[9px] text-indigo-400 select-none tracking-widest leading-none animate-pulse">GRID SYSTEM: 100x100</span>
          </div>
          <div className="flex justify-between p-2">
            <span className="font-mono text-[9px] text-slate-500 select-none tracking-widest leading-none">ARABIAN SEA FLANK ZONE</span>
            <span className="font-mono text-[9px] text-slate-500 select-none tracking-widest leading-none">2026 UTC CLOCK</span>
          </div>
        </div>

        {/* Dynamic Stylized Coastlines, Lakes and expressways using SVG paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Western Peninsula Shoreline representation */}
          <path 
            d="M 12 0 Q 25 35 15 55 T 5 95 L 0 100 L 0 0 Z" 
            fill="#0f172a" 
            opacity="0.9"
          />
          <path 
            d="M 12 0 Q 25 35 15 55 T 5 95" 
            fill="none" 
            stroke="#1e293b" 
            strokeWidth="1.2" 
            strokeDasharray="2,2"
          />
          
          {/* Powai Lake SVG Shape */}
          <ellipse cx="80" cy="32" rx="14" ry="11" fill="#1e293b" opacity="0.4" />
          <text x="80" y="32" fill="#475569" fontSize="1.8" fontWeight="bold" textAnchor="middle">Powai Lake</text>

          {/* SGN Park Greenery range (Top background map contour) */}
          <path 
            d="M 60 0 Q 75 15 95 5 T 100 15 L 100 0 Z" 
            fill="#14532d" 
            opacity="0.1" 
          />

          {/* Express Highways mapped as subtle glowing neon pathways */}
          {/* Western Express Highway representation (WEH) */}
          <path 
            d="M 35 0 C 37 30 42 50 25 80 C 20 90 15 100 15 100" 
            fill="none" 
            stroke="#1e1b4b" 
            strokeWidth="1" 
            opacity="0.6"
          />
          <path 
            d="M 35 0 C 37 30 42 50 25 80 C 20 90 15 100 15 100" 
            fill="none" 
            stroke="#4f46e5" 
            strokeWidth="0.4" 
            opacity="0.25"
            strokeDasharray="4,6"
          />

          {/* Jogeshwari-Vikhroli Link Road (JVLR) connecting east-west range */}
          <path 
            d="M 23 45 Q 50 42 80 32" 
            fill="none" 
            stroke="#4338ca" 
            strokeWidth="0.3" 
            opacity="0.3"
          />

          {/* Map Region Text Labels */}
          <text x="25" y="78" fill="#334155" fontSize="2.2" fontWeight="bold" letterSpacing="0.1" opacity="0.8">Bandra (W)</text>
          <text x="59" y="52" fill="#334155" fontSize="2.2" fontWeight="bold" letterSpacing="0.1" opacity="0.8">Andheri (E)</text>
          <text x="78" y="21" fill="#334155" fontSize="2.2" fontWeight="bold" letterSpacing="0.1" opacity="0.8">Powai Hills</text>
          <text x="46" y="63" fill="#334155" fontSize="2.2" fontWeight="bold" letterSpacing="0.1" opacity="0.8">Vile Parle</text>
        </svg>

        {/* Floating Animated Pins Layer */}
        <div className="absolute inset-0 z-10">
          {venues.map((venue, index) => {
            const coords = getVenueCoords(venue.id, index);
            const isActive = venue.id === activeVenueId;
            const isHovered = venue.id === hoveredVenueId;
            const isTurf = venue.type === 'turf';

            return (
              <div 
                key={venue.id} 
                className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              >
                
                {/* Active Ripple Animation Effect */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.8, opacity: 0.4 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                      className={`absolute -inset-4 rounded-full pointer-events-none ${
                        isTurf ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                    />
                  )}
                </AnimatePresence>

                {/* Pin Button */}
                <button
                  type="button"
                  onClick={() => setActiveVenueId(venue.id)}
                  onMouseEnter={() => setHoveredVenueId(venue.id)}
                  onMouseLeave={() => setHoveredVenueId(null)}
                  className={`relative p-2 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                    isActive
                      ? isTurf 
                        ? 'bg-emerald-500 scale-125 z-40 ring-4 ring-emerald-500/30' 
                        : 'bg-purple-500 scale-125 z-40 ring-4 ring-purple-500/30'
                      : isHovered
                      ? isTurf
                        ? 'bg-emerald-600 scale-115 z-30'
                        : 'bg-purple-600 scale-115 z-30'
                      : isTurf
                      ? 'bg-teal-950/80 border border-emerald-500 text-emerald-400 z-20 hover:scale-110'
                      : 'bg-indigo-950/80 border border-purple-500 text-purple-400 z-20 hover:scale-110'
                  }`}
                >
                  {isTurf ? (
                    <Trophy size={14} className={isActive ? 'text-white' : ''} />
                  ) : (
                    <Gamepad2 size={14} className={isActive ? 'text-white' : ''} />
                  )}

                  {/* Marker Little Label Tag for quick scannability */}
                  <span className={`absolute top-full mt-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider block whitespace-nowrap border pointer-events-none select-none transition-all ${
                    isActive
                      ? isTurf
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                        : 'bg-purple-500 border-purple-400 text-white shadow-md'
                      : isHovered
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-950/90 border-slate-800 text-slate-400 opacity-60'
                  }`}>
                    {venue.name.split(' ')[0]}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Live Detail View Floating Overlay Pop-up */}
        <AnimatePresence>
          {activeVenue && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-25 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  activeVenue.type === 'turf' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {activeVenue.type}
                </span>
                
                <button
                  type="button"
                  onClick={() => setActiveVenueId(null)}
                  className="p-1 -m-1 text-slate-500 hover:text-white transition-colors cursor-pointer select-none"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex gap-4 mt-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900 shadow-inner">
                  <img src={activeVenue.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                    {activeVenue.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                    <MapPin size={11} className="text-indigo-400" />
                    <span>{activeVenue.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5 text-xs text-yellow-400 font-black">
                      <Star size={11} className="fill-yellow-400" />
                      {activeVenue.rating}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold border-l border-zinc-800 pl-1.5">
                      Verified Site
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3.5 text-[11px] text-gray-400 font-bold italic line-clamp-2 leading-relaxed">
                "{activeVenue.description}"
              </p>

              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none">Hourly Fee:</span>
                  <span className="text-sm font-black text-white block mt-1">₹{activeVenue.pricePerHour}/hr</span>
                </div>
                
                <Link
                  to={`/venue/${activeVenue.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-950 hover:bg-indigo-550 transition-all select-none"
                >
                  Secure Slot <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
