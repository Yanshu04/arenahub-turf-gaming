/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, MapPin, Clock, Trophy, ChevronLeft, ChevronRight, 
  Wifi, Shield, Zap, Car, Coffee, HelpCircle, Gamepad2
} from 'lucide-react';
import { Venue } from '../lib/mockData';

interface VenueCardProps {
  venue: Venue;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  floodlights: <Zap size={11} className="text-amber-500" />,
  'changing rooms': <Shield size={11} className="text-blue-500" />,
  'Wi-Fi': <Wifi size={11} className="text-indigo-500" />,
  showers: <Clock size={11} className="text-teal-500" />,
  parking: <Car size={11} className="text-gray-500" />,
  refreshments: <Coffee size={11} className="text-red-500" />,
  ac: <Zap size={11} className="text-sky-500" />,
  lounge: <Trophy size={11} className="text-purple-500" />,
  'gaming peripherals': <Gamepad2 size={11} className="text-purple-500" />,
};

export default function VenueCard({ venue }: VenueCardProps) {
  const images = venue.images && venue.images.length > 0 ? venue.images : [venue.image];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4500); // Auto advances slide every 4.5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 transition-shadow hover:shadow-2xl hover:shadow-gray-200/50 flex flex-col h-full"
    >
      {/* Top Media Block with Carousel */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900 shrink-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIdx}
            src={images[currentIdx]}
            alt={`${venue.name} - view ${currentIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Carousel Overlay Controllers */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs hover:scale-110 active:scale-95 transition-all select-none cursor-pointer z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs hover:scale-110 active:scale-95 transition-all select-none cursor-pointer z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    idx === currentIdx ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Rating Floating Tag */}
        <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-black text-gray-900 flex items-center gap-1 shadow-sm select-none">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          {venue.rating}
        </div>
      </div>

      {/* Card Info Segments */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight leading-tight group-hover:text-indigo-650 transition-colors">
                {venue.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400 font-bold leading-none">
                <MapPin size={12} className="text-indigo-500" /> {venue.location}
              </p>
            </div>
            
            <span className={`rounded-xl px-2.5 py-0.8 text-[8px] font-black uppercase tracking-widest border shrink-0 ${
              venue.type === 'turf' 
                ? 'bg-green-50 border-green-100 text-green-700' 
                : 'bg-purple-50 border-purple-100 text-purple-700'
            }`}>
              {venue.type}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
            {venue.description}
          </p>

          {/* Render Amenities badges inside the home card */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {venue.amenities.map((amenity) => (
                <span 
                  key={amenity}
                  className="inline-flex items-center gap-1 text-[9px] font-black text-gray-650 uppercase tracking-wide bg-gray-50 border border-gray-100/60 px-2 py-0.5 rounded-lg select-none"
                >
                  {AMENITY_ICONS[amenity] || <HelpCircle size={9} />}
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Hourly Fee</p>
              <p className="text-lg font-black text-gray-950 leading-none mt-1">
                ₹{venue.pricePerHour}<span className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">/hr</span>
              </p>
            </div>
            <Link
              to={`/venue/${venue.id}`}
              className="rounded-xl bg-gray-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-indigo-600 hover:scale-102 active:scale-95 select-none cursor-pointer"
            >
              Book Now
            </Link>
          </div>

          {/* Little Trust Labels */}
          <div className="mt-4 flex gap-4 border-t border-dotted border-gray-100 pt-3">
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-405 uppercase tracking-widest select-none">
              <Clock size={11} className="text-indigo-400" /> Instant Access
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-450 uppercase tracking-widest select-none">
              <Trophy size={11} className="text-indigo-400" /> Pro Facility
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
