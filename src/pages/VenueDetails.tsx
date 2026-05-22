/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MOCK_SLOTS } from '../lib/mockData';
import { useBooking } from '../context/MockBookingContext';
import { useAuth } from '../context/MockAuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, ChevronRight, Info, CheckCircle2,
  MapPin, Coffee, Wifi, Car, Lightbulb, Tv, Gamepad2, Shield, 
  ZoomIn, ZoomOut, Navigation, Sparkles, Star, MessageSquare,
  ThumbsUp, Send, Check, User, Trash2
} from 'lucide-react';

// Dynamic opening hours status calculator based on current time
const isVenueOpen = (hoursStr: string): { isOpen: boolean; message: string } => {
  if (hoursStr.includes('24 Hours') || hoursStr.toLowerCase().includes('24/7')) {
    return { isOpen: true, message: 'Open 24/7' };
  }
  
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentFormattedVal = currentHour * 60 + currentMin; // minutes from midnight

    // Match strings like "06:00 AM - 11:30 PM"
    const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      const startAmPm = match[3].toUpperCase();
      
      const endHour = parseInt(match[4], 10);
      const endMin = parseInt(match[5], 10);
      const endAmPm = match[6].toUpperCase();
      
      let startHours24 = startHour;
      if (startAmPm === 'PM' && startHour < 12) startHours24 += 12;
      else if (startAmPm === 'AM' && startHour === 12) startHours24 = 0;
      
      let startMinutesFromMidnight = startHours24 * 60 + startMin;
      
      let endHours24 = endHour;
      if (endAmPm === 'PM' && endHour < 12) endHours24 += 12;
      else if (endAmPm === 'AM' && endHour === 12) endHours24 = 0;
      
      let endMinutesFromMidnight = endHours24 * 60 + endMin;
      
      if (currentFormattedVal >= startMinutesFromMidnight && currentFormattedVal <= endMinutesFromMidnight) {
        return { isOpen: true, message: `Open Now • Closes at ${match[4]}:${match[5]} ${match[6]}` };
      } else {
        return { isOpen: false, message: `Closed • Opens at ${match[1]}:${match[2]} ${match[3]}` };
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return { isOpen: true, message: 'Open Now' };
};

const venueDetailsMap: Record<string, {
  openingHours: string;
  phone: string;
  address: string;
  coordinates: { lat: number; lng: number };
  mapType: 'coast' | 'metro' | 'lake' | 'airport';
  mapLabel: string;
  amenities: { name: string; description: string; icon: any }[];
}> = {
  t1: {
    openingHours: "06:00 AM - 11:30 PM",
    phone: "+91 98765 43210",
    address: "Carter Road Promenade, Bandra West, Mumbai - 400050",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    mapType: "coast",
    mapLabel: "Arabian Sea Shoreline",
    amenities: [
      { name: "FIFA-Grade Grass", description: "Pro turf surface with rubber infills for joint cushion", icon: Sparkles },
      { name: "Locker Rooms", description: "Secure passcode-locked cabinets for belongings", icon: Shield },
      { name: "Shower Facilities", description: "Fresh water showers with organic bath essentials", icon: Shield },
      { name: "Premium Floodlights", description: "Daylight-simulating shadowless high-mast LEDs", icon: Lightbulb },
      { name: "Free Parking", description: "On-site secure parking for cars and two-wheelers", icon: Car },
      { name: "Water Station", description: "Purified cold water dispensers & hydration booster", icon: Coffee }
    ]
  },
  t2: {
    openingHours: "07:00 AM - 11:00 PM",
    phone: "+91 98765 43211",
    address: "Saki Vihar Road, Andheri East, Mumbai - 400072",
    coordinates: { lat: 19.1136, lng: 72.8697 },
    mapType: "metro",
    mapLabel: "Metro Corridor View",
    amenities: [
      { name: "Cricket Netting", description: "High tension net borders to keep balls inside the box", icon: Shield },
      { name: "Cozy Cafe", description: "Refreshment station selling hot drinks and fresh meals", icon: Coffee },
      { name: "Seating Dugout", description: "Comfortable cushioned player seats and kit racks", icon: Tv },
      { name: "Drinking Water", description: "Chilled RO drinking water station", icon: Coffee },
      { name: "Free Parking", description: "Spacious dedicated basement parking", icon: Car },
      { name: "Daylight Floodlights", description: "Ultra bright LED lights for night sessions", icon: Lightbulb }
    ]
  },
  g1: {
    openingHours: "24 Hours (Open Daily)",
    phone: "+91 98765 43212",
    address: "Supreme Business Park, Powai, Mumbai - 400076",
    coordinates: { lat: 19.1176, lng: 72.9060 },
    mapType: "lake",
    mapLabel: "Powai Lakefront Hub",
    amenities: [
      { name: "RTX 4080 RIGs", description: "Equipped with Core i7, RTX 4080 and 32GB RAM", icon: Gamepad2 },
      { name: "240Hz Monitors", description: "Superfluid high-refresh esports panels", icon: Tv },
      { name: "Secretlab Chairs", description: "Premium ergonomic gaming seats for endurance comfort", icon: Sparkles },
      { name: "1 Gbps Fiber Wi-Fi", description: "Dual-redundant gigabit fiber channels", icon: Wifi },
      { name: "Premium AC Lounge", description: "Climate controlled gaming halls kept at crisp 19°C", icon: Sparkles },
      { name: "Energy Drink Cafe", description: "Stocked with iced cold energy drinks and snacks", icon: Coffee }
    ]
  },
  g2: {
    openingHours: "10:00 AM - 10:00 PM",
    phone: "+91 98765 43213",
    address: "Irla Society Road, Vile Parle, Mumbai - 400056",
    coordinates: { lat: 19.1025, lng: 72.8454 },
    mapType: "airport",
    mapLabel: "Airport Terminal Crossroad",
    amenities: [
      { name: "PS5 Console Zone", description: "DualSense controllers on 55\" 4K HDR screens", icon: Tv },
      { name: "High-spec Pro PCs", description: "Equipped with RTX 3070 and rapid mechanical gear", icon: Gamepad2 },
      { name: "Fibre Optic Net", description: "Ultra low ping dedicated lease lines", icon: Wifi },
      { name: "Tasty Snack Bar", description: "Quick bites, noodles and mocktails served hot", icon: Coffee },
      { name: "Locker Lockers", description: "Safe storage space for college bags and gear", icon: Shield },
      { name: "Full AC Arena", description: "Airy, well-ventilated temperature controlled hall", icon: Sparkles }
    ]
  }
};

function VisualMapPreview({ 
  name, 
  locationName, 
  mapType, 
  mapLabel, 
  address 
}: { 
  name: string; 
  locationName: string; 
  mapType: 'coast' | 'metro' | 'lake' | 'airport'; 
  mapLabel: string;
  address: string;
}) {
  const [zoom, setZoom] = useState(1);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));

  const mapDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name + ', ' + address)}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-slate-900 text-white shadow-lg h-72">
      {/* Background Grid and Streets SVG */}
      <div className="absolute inset-0 select-none">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
            <pattern id="mapPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#0b0f19" />
          <rect width="100%" height="100%" fill="url(#mapPattern)" />

          {/* Scaleable street and landscape layers */}
          <g style={{ transform: `scale(${zoom})`, transformOrigin: '200px 150px' }} className="transition-transform duration-300 ease-out">
            
            {/* Environmental elements based on mapType */}
            {mapType === 'coast' && (
              <>
                {/* Coastal ocean body */}
                <path d="M 0 0 Q 110 80 80 300 L 0 300 Z" fill="rgba(30, 58, 138, 0.25)" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="3" />
                <text x="25" y="160" fill="rgba(59, 130, 246, 0.4)" fontSize="10" fontWeight="bold" className="tracking-widest capitalize rotate-90 font-mono">Arabian Sea</text>
              </>
            )}

            {mapType === 'lake' && (
              <>
                {/* Lake outline */}
                <path d="M 120 180 Q 80 120 160 80 T 260 120 T 200 220 Z" fill="rgba(30, 58, 138, 0.25)" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="3" />
                <text x="155" y="145" fill="rgba(59, 130, 246, 0.4)" fontSize="10" fontWeight="bold" className="tracking-widest capitalize font-mono">Powai Lake</text>
              </>
            )}

            {mapType === 'metro' && (
              <>
                {/* Metro train line track */}
                <line x1="0" y1="260" x2="400" y2="40" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="4" strokeDasharray="6,4" />
                <text x="260" y="130" fill="rgba(168, 85, 247, 0.4)" fontSize="8" fontWeight="bold" className="tracking-widest rotate-[-30deg] font-mono">Metro Line 1</text>
              </>
            )}

            {mapType === 'airport' && (
              <>
                {/* Airport runway path */}
                <rect x="0" y="220" width="400" height="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="15,10" transform="rotate(-15 200 230)" />
                <text x="180" y="225" fill="rgba(255, 255, 255, 0.15)" fontSize="8" fontWeight="black" className="tracking-widest rotate-[-15deg] font-mono">RUNWAY 09/27</text>
              </>
            )}

            {/* Common Streets/Grid (styled mock maps have crisp streets) */}
            {/* Primary Highway */}
            <path d="M -50 150 Q 150 140 450 150" fill="none" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="10" />
            <path d="M -50 150 Q 150 140 450 150" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,3" />
            <text x="300" y="165" fill="rgba(255,255,255,0.3)" fontSize="8" className="tracking-wide">LBS Marg / Link Road</text>

            {/* Secondary Roads */}
            <line x1="120" y1="-50" x2="120" y2="350" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="6" />
            <line x1="280" y1="-50" x2="280" y2="350" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="6" />
            <line x1="200" y1="-50" x2="200" y2="350" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="4" />

            <text x="125" y="40" fill="rgba(255,255,255,0.2)" fontSize="7" className="rotate-90 origin-left transform tracking-wider uppercase">Main Boulevard</text>
            <text x="210" y="270" fill="rgba(255,255,255,0.2)" fontSize="7" className="rotate-90 origin-left transform tracking-wider uppercase">Market St</text>

            {/* Green Parks */}
            <rect x="250" y="30" width="80" height="50" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
            <text x="268" y="58" fill="rgba(16, 185, 129, 0.35)" fontSize="9" fontWeight="bold">Local Park</text>

            <rect x="50" y="190" width="90" height="70" rx="12" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
            <text x="68" y="230" fill="rgba(16, 185, 129, 0.35)" fontSize="9" fontWeight="bold">Sports Club</text>

            {/* Surrounding Landmark Labels */}
            <text x="295" y="260" fill="rgba(255, 255, 255, 0.25)" fontSize="8" className="font-medium">Retail Arcade</text>
            
            {/* The Venue Target (glowing center node!) */}
            <g transform="translate(200, 110)">
              {/* Pulsing ring */}
              <circle r="22" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: 'center', animationDuration: '3s' }} />
              <circle r="12" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
              <circle r="6" fill="#6366f1" className="shadow-lg shadow-indigo-500/50" />
              {/* Small custom marker point pin */}
              <path d="M 0 -1 C -2 -1 -3 -3 -3 -5 C -3 -9 0 -13 0 -13 C 0 -13 3 -9 3 -5 C 3 -3 2 -1 0 -1 Z" fill="#4f46e5" stroke="#ffffff" strokeWidth="1" />
            </g>

            {/* Label box for the Venue */}
            <foreignObject x="110" y="50" width="180" height="42" className="overflow-visible select-none pointer-events-none">
              <div className="flex flex-col items-center justify-center bg-gray-900/95 text-white text-[9px] px-2 py-1.5 rounded-lg border border-indigo-500/40 shadow-xl backdrop-blur-sm text-center">
                <span className="font-extrabold tracking-tight truncate max-w-[150px]">{name}</span>
                <span className="text-[7px] text-indigo-300 font-bold tracking-widest uppercase mt-0.5">{mapLabel}</span>
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
        <button 
          onClick={handleZoomIn}
          title="Zoom In"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-700/50 text-white shadow backdrop-blur transition-all active:scale-95"
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={handleZoomOut}
          title="Zoom Out"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-700/50 text-white shadow backdrop-blur transition-all active:scale-95"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Bottom Info Banner & Real Action Trigger */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-gray-950/85 backdrop-blur-sm rounded-2xl p-3 border border-gray-800/80 z-20">
        <div className="flex items-center gap-2 max-w-[65%]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/30">
            <MapPin size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none mb-0.5">Location Address</p>
            <p className="text-[11px] text-gray-300 truncate font-semibold leading-tight">{address}</p>
          </div>
        </div>
        <a 
          href={mapDirectionUrl}
          target="_blank"
          rel="noreferrer"
          referrerPolicy="no-referrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all select-none group/dir"
        >
          <Navigation size={10} className="group-hover/dir:translate-x-0.5 group-hover/dir:-translate-y-0.5 transition-transform" />
          Navigate
        </a>
      </div>
    </div>
  );
}

const reviewsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const reviewItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPending, venues, bookings, reviews, addReview, showToast } = useBooking();
  const { user } = useAuth();
  const [selectedDateNum, setSelectedDateNum] = useState<number>(22);
  const [selectedSlots, setSelectedSlots] = useState<{ dateNum: number; dateStr: string; slot: string; price: number }[]>([]);

  const getWeekDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekIndex = (5 + day - 1) % 7; // May 1, 2026 is Friday (5)
    return days[dayOfWeekIndex];
  };

  const selectedDateStr = `${getWeekDayName(selectedDateNum)}, ${selectedDateNum} May 2026`;

  // Deterministically fetch slots for mock calendar display
  const getSlotsForDate = (dateNum: number) => {
    return MOCK_SLOTS.map(slot => {
      // Deterministic fully booked day when dayNum is a multiple of 6
      if (dateNum % 6 === 0) {
        return { ...slot, isAvailable: false };
      }
      // Deterministic availability based on date num and slot ID
      const seed = (dateNum * 13 + parseInt(slot.id.replace(/\D/g, '')) * 7) % 5;
      const isAvailable = seed !== 0;
      return { ...slot, isAvailable };
    });
  };

  const currentSlots = getSlotsForDate(selectedDateNum);

  // Review states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [bypassCheck, setBypassCheck] = useState<boolean>(false);

  const venue = venues.find(v => v.id === id);

  if (!venue) return <div className="text-center py-20 font-bold text-red-500">Venue Not Found</div>;

  const details = venueDetailsMap[venue.id] || venueDetailsMap['t1'];
  const status = isVenueOpen(details.openingHours);

  const handleSlotToggle = (slotTime: string) => {
    const idx = selectedSlots.findIndex(s => s.dateNum === selectedDateNum && s.slot === slotTime);
    if (idx > -1) {
      // Deselect slot
      setSelectedSlots(selectedSlots.filter((_, i) => i !== idx));
    } else {
      // Select slot
      setSelectedSlots([
        ...selectedSlots,
        {
          dateNum: selectedDateNum,
          dateStr: selectedDateStr,
          slot: slotTime,
          price: venue.pricePerHour
        }
      ]);
    }
  };

  const handleProceed = () => {
    if (selectedSlots.length === 0) return;
    
    // Sort chronologically by date then slot
    const sortedSlots = [...selectedSlots].sort((a, b) => {
      if (a.dateNum !== b.dateNum) return a.dateNum - b.dateNum;
      return a.slot.localeCompare(b.slot);
    });

    const isMulti = sortedSlots.length > 1;
    const firstSlot = sortedSlots[0];

    // Formulate slots text list and dates text list
    const slotText = isMulti 
      ? `${sortedSlots.length} Slots Multi-Pass` 
      : firstSlot.slot;
    const dateText = isMulti 
      ? `${sortedSlots.map(s => `${s.dateNum} May`).filter((v, i, a) => a.indexOf(v) === i).join(', ')} (Multi-Pass)` 
      : firstSlot.dateStr;

    setPending({
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      slot: slotText,
      date: dateText,
      totalAmount: sortedSlots.length * venue.pricePerHour,
      isMultiPass: isMulti,
      multiSlots: sortedSlots.map(s => ({
        dateStr: s.dateStr,
        slot: s.slot,
        price: s.price
      }))
    });
    
    navigate('/checkout');
  };

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      {/* Left: Venue Info */}
      <div className="lg:col-span-2 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm"
        >
          <img src={venue.image} alt={venue.name} className="h-96 w-full object-cover" />
          <div className="p-8">
            <h1 className="text-4xl font-extrabold text-gray-900">{venue.name}</h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">{venue.description}</p>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Premium Setup</p>
                <p className="mt-1 text-sm font-medium text-gray-700">Pro-grade infrastructure guaranteed.</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">Instant Confirm</p>
                <p className="mt-1 text-sm font-medium text-gray-700">Get your pass immediately via SMS.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expanded Venue Information: Amenities, Timings, Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Amenities card */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2.5 text-gray-900 leading-none">
                <Sparkles size={22} className="text-indigo-600" />
                Featured Amenities
              </h2>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                PRO-GRADE INFRASTRUCTURE AT YOUR SERVICE
              </p>
              
              <div className="grid grid-cols-1 gap-5 mt-8">
                {details.amenities.map((item, index) => {
                  const IconComp = item.icon;
                  return (
                    <div key={index} className="flex gap-4 items-start group">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 border border-gray-100 transition-colors">
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 leading-tight">{item.name}</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Operational Hours & Map Grid */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 flex-1 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2.5 text-gray-900 leading-none">
                  <Clock size={22} className="text-indigo-605" />
                  Operational Hours
                </h2>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  SCHEDULES & WEEKLY TIMINGS
                </p>

                <div className="space-y-4 mt-8">
                  {/* Dynamically calculated status */}
                  <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                    status.isOpen 
                      ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-800' 
                      : 'bg-red-50/50 border-red-100/80 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          status.isOpen ? 'bg-emerald-400' : 'bg-red-400'
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          status.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider">{status.message}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">STATUS NOW</span>
                  </div>

                  <div className="space-y-3.5 text-xs font-bold text-gray-650 mt-4">
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-400 font-semibold">Monday - Friday</span>
                      <span className="text-gray-800 font-extrabold">{details.openingHours}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-400 font-semibold">Saturday</span>
                      <span className="text-gray-800 font-extrabold">{details.openingHours}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-400 font-semibold">Sunday</span>
                      <span className="text-gray-800 font-extrabold">{details.openingHours}</span>
                    </div>
                    <div className="flex justify-between py-1.5 items-center">
                      <span className="text-gray-400 font-semibold">Direct Support</span>
                      <span className="text-indigo-600 font-extrabold hover:underline select-all">{details.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual map preview insert */}
            <VisualMapPreview 
              name={venue.name} 
              locationName={venue.location} 
              mapType={details.mapType} 
              mapLabel={details.mapLabel}
              address={details.address} 
            />
          </div>
        </motion.div>

        {/* Calendar & Slot Selection Panel */}
        <div className="space-y-6">
          {/* Calendar Block */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-950 flex items-center gap-2.5">
                  <Calendar size={22} className="text-indigo-600 animate-bounce" />
                  Select Date • May 2026
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1 leading-none">
                  Choose a game day before selecting hourly slots
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 px-4 py-2.5 shrink-0 self-start sm:self-auto">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-widest leading-none">{selectedDateStr}</span>
              </div>
            </div>

            {/* Calendar Legend Indicators */}
            <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest bg-gray-50/60 p-3 rounded-2xl border border-gray-100/60">
              <span className="text-gray-400 self-center mr-1">Calendar Legend:</span>
              <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-lg bg-indigo-600 shadow-sm"></div> Selected</span>
              <span className="flex items-center gap-1.5"><div className="h-3 w-3 bg-emerald-50 border border-emerald-200 rounded-lg"></div> Available</span>
              <span className="flex items-center gap-1.5"><div className="h-3 w-3 bg-red-50 border border-red-200 rounded-lg"></div> Fully Booked</span>
              <span className="flex items-center gap-1.5"><div className="h-3 w-3 bg-gray-50 border border-gray-100 rounded-lg"></div> Past Date</span>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Numbers Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty offsets for May 1, 2026 (starts on a Friday, so 5 padding empty blocks) */}
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square bg-gray-50/30 rounded-xl border border-dashed border-gray-100/50" />
              ))}

               {/* May 1 - May 31 days */}
              {Array.from({ length: 31 }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = selectedDateNum === dayNum;
                const isPast = dayNum < 22; // today is May 22, 2026
                const daySlots = getSlotsForDate(dayNum);
                const bookedCount = daySlots.filter(s => !s.isAvailable).length;
                const isFullyBooked = bookedCount === daySlots.length;
                const slotsOnDay = selectedSlots.filter(s => s.dateNum === dayNum).length;

                return (
                  <button
                    type="button"
                    key={`day-${dayNum}`}
                    disabled={isPast || isFullyBooked}
                    onClick={() => {
                       setSelectedDateNum(dayNum);
                    }}
                    className={`aspect-square relative rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isPast 
                        ? 'bg-gray-50/50 text-gray-300 border-gray-100/30 cursor-not-allowed text-xs'
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-650 text-white shadow-xl shadow-indigo-150 scale-102 font-black text-sm z-10'
                          : isFullyBooked
                            ? 'bg-red-50 text-red-500 border-red-200/60 hover:bg-red-50 text-xs shadow-inner cursor-not-allowed opacity-70'
                            : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 text-emerald-800 font-extrabold text-xs hover:scale-102 hover:shadow-xs'
                    }`}
                  >
                    <span className={isFullyBooked && !isPast ? 'line-through text-red-400/80 mr-0.5' : ''}>{dayNum}</span>
                    {slotsOnDay > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-indigo-500 text-[8px] font-black text-white flex items-center justify-center border border-white shadow-xs animate-scaleIn">
                        {slotsOnDay}
                      </span>
                    )}
                    {!isPast && (
                      <div className="absolute bottom-1.5 flex gap-1 justify-center w-full">
                        {isFullyBooked ? (
                          <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                        ) : bookedCount > 0 ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Block */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock size={24} className="text-indigo-600" />
                Available Slots for {selectedDateNum} May
              </h2>
              <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-indigo-600 shadow-sm shadow-indigo-100"></div> Selected</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-white border border-gray-200"></div> Available</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-red-50 border border-red-100"></div> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {currentSlots.map((slot) => {
                const isSelected = selectedSlots.some(s => s.dateNum === selectedDateNum && s.slot === slot.time);
                return (
                  <button
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    onClick={() => handleSlotToggle(slot.time)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl py-4 transition-all border ${
                      !slot.isAvailable 
                        ? 'cursor-not-allowed bg-red-50/50 border-red-50 text-red-300' 
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-105 z-10 scale-102 font-black'
                          : 'bg-white border-gray-150 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-605'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isSelected ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {slot.time.split(' ')[1]}
                    </span>
                    <span className="text-lg font-black tracking-tighter leading-tight">{slot.time.split(' ')[0]}</span>
                    
                    {!slot.isAvailable ? (
                      <span className="mt-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-red-100 text-red-500">
                        Booked
                      </span>
                    ) : isSelected ? (
                      <span className="mt-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/20">
                        Selected
                      </span>
                    ) : (
                      <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-transparent group-hover:text-indigo-455">
                        Available
                      </span>
                    )}

                    {!slot.isAvailable && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_transparent_70%,_rgba(239,68,68,0.05)_100%)]"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Community Reviews & Ratings System */}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-950 flex items-center gap-2.5 leading-none">
                <MessageSquare size={22} className="text-indigo-600 animate-pulse" />
                Player Reviews
              </h2>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                VERIFIED COMMUNITY EXPERIENCE & RATINGS
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-2xl shrink-0">
              <div className="text-center shrink-0">
                <p className="text-2xl font-black text-gray-950 leading-none">{venue.rating}</p>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">RATING</span>
              </div>
              <div className="h-6 w-[1px] bg-gray-250"></div>
              <div className="flex flex-col">
                <div className="flex gap-0.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const fillVal = Math.round(venue.rating);
                    return (
                      <Star 
                        key={star} 
                        size={12} 
                        className={`${star <= fillVal ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                      />
                    );
                  })}
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1.5">
                  {reviews.filter(r => r.venueId === venue.id).length} Reviews
                </span>
              </div>
            </div>
          </div>

          {/* The Reviews List Block */}
          <motion.div 
            variants={reviewsContainerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 max-h-[360px] overflow-y-auto pr-2"
          >
            {reviews.filter(r => r.venueId === venue.id).length === 0 ? (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">No community reviews yet</p>
                <p className="text-xs font-medium text-gray-500 mt-1">Be the first to share your experience details!</p>
              </div>
            ) : (
              reviews.filter(r => r.venueId === venue.id).map((rev) => (
                <motion.div 
                  key={rev.id} 
                  variants={reviewItemVariants}
                  className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100/80 hover:border-indigo-150/50 hover:bg-white hover:shadow-md transition-all duration-300 flex gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-extrabold text-xs shrink-0 shadow-inner select-none uppercase">
                    {rev.userName.substring(0, 2)}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 leading-none">{rev.userName}</h4>
                        <p className="text-[9px] text-gray-400 font-bold tracking-tight uppercase mt-1 leading-none">{rev.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={11} 
                            className={`${star <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-650 leading-relaxed italic">
                      "{rev.text}"
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Add Review Form */}
          <div className="border-t border-gray-50 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                Share Guest Feedback
              </h3>
              
              {/* Bypass check for tester convenience */}
              <button
                type="button"
                onClick={() => setBypassCheck(!bypassCheck)}
                className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all select-none ${
                  bypassCheck 
                    ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm font-extrabold' 
                    : 'bg-white border-gray-150 text-gray-400 hover:text-indigo-650 hover:bg-indigo-50/50'
                }`}
              >
                {bypassCheck ? '✓ Review Demo Override: Active' : 'ByPass Verification for Testing'}
              </button>
            </div>

            {(() => {
              const hasBookedThisVenue = bookings.some(b => b.venueId === venue.id && (b.userId === user?.id || b.userId === 'guest'));
              const allowedToReview = hasBookedThisVenue || bypassCheck;

              return allowedToReview ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!reviewerName.trim() && !user) {
                    showToast('Please enter your name to display on the review.');
                    return;
                  }
                  if (!reviewText.trim()) {
                    showToast('Please write your review feedback.');
                    return;
                  }
                  
                  addReview({
                    venueId: venue.id,
                    userId: user?.id || 'guest',
                    userName: user?.name || reviewerName.trim() || 'Guest Player',
                    rating: rating,
                    text: reviewText.trim()
                  });
                  
                  setReviewText('');
                  setRating(5);
                  showToast('Published your player review! Rating updated dynamically.');
                }} className="space-y-4">
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Rating Stars Input */}
                    <div className="space-y-1.5 rounded-2xl bg-gray-50/60 border border-gray-100/50 p-4">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-450 block">Tap to rate stars:</span>
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                            return (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="p-1 -m-1 transition-all hover:scale-125 focus:outline-none cursor-pointer"
                              >
                                <Star 
                                  size={24} 
                                  className={`${
                                    active 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-200'
                                  } transition-colors`} 
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-black text-indigo-650 ml-1 select-none">
                          {rating === 5 ? 'Perfect! (5/5)' : rating === 4 ? 'Great! (4/5)' : rating === 3 ? 'Decent (3/5)' : rating === 2 ? 'Subpar (2/5)' : 'Poor (1/5)'}
                        </span>
                      </div>
                    </div>

                    {/* User identification input */}
                    <div className="space-y-1.5 rounded-2xl bg-gray-50/60 border border-gray-100/50 p-4 flex flex-col justify-center">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-450 block">Your Display Name:</span>
                      {user ? (
                        <div className="flex items-center gap-2 mt-1 select-none">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">{user.name}</span>
                          <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">Customer</span>
                        </div>
                      ) : (
                        <input 
                          type="text"
                          maxLength={30}
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Your Name e.g. Rohan S."
                          className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-150 rounded-xl px-3 py-2 mt-1 focus:border-indigo-500 focus:outline-none placeholder-gray-300 shadow-sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Text Area */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black tracking-widest uppercase text-gray-450 block">Short Experience Review:</span>
                    <div className="relative">
                      <textarea
                        rows={3}
                        maxLength={140}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write dynamic feedback about turf bounce, console ping, acoustics, or lights... (Max 140 chars)"
                        className="w-full text-xs font-medium text-gray-750 bg-white border border-gray-150 p-3.5 rounded-2xl focus:border-indigo-500 focus:outline-none shadow-inner pr-12 leading-relaxed"
                      />
                      <button
                        type="submit"
                        className="absolute right-3.5 bottom-3.5 h-8 w-8 rounded-xl bg-gray-950 text-white flex items-center justify-center hover:bg-indigo-650 hover:scale-105 active:scale-90 transition-all shadow-md select-none cursor-pointer"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>

                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-150 bg-gray-50/50 p-6 flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-white text-gray-400 flex items-center justify-center border border-gray-150 mb-3 select-none">
                    <Info size={16} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Booking Verified Access Only</p>
                  <p className="text-xs text-gray-500 font-medium mt-1.5 max-w-sm leading-relaxed">
                    Only guests who have booked a confirmed session at this facility are permitted to publish feedback. Pick a slot above and complete card checkout!
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Right: Booking Summary / Sticky */}
      <div className="lg:sticky lg:top-24 h-fit">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gray-900 p-8 shadow-2xl text-white space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" />
              Booking Summary
            </h3>
            {selectedSlots.length > 1 && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Multi-Pass Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-400 font-medium">Session Rate</span>
              <span className="font-bold">₹{venue.pricePerHour} <span className="text-gray-500 text-xs font-normal">/ hr</span></span>
            </div>

            {/* Selected Slots list */}
            <div className="border-b border-gray-800 pb-4 space-y-2.5">
              <span className="text-gray-400 font-medium block text-xs">Selected Sessions ({selectedSlots.length})</span>
              {selectedSlots.length === 0 ? (
                <p className="text-xs text-gray-500 italic pb-2">No slots chosen. Select days and available times above to add passes.</p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                  {selectedSlots.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] transition-all duration-200"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{item.dateStr.split(',')[1].trim()}</p>
                        <p className="text-xs font-bold text-indigo-300">{item.slot}</p>
                      </div>
                      <button
                        type="button"
                        title="Remove pass"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlots(selectedSlots.filter((_, i) => i !== idx)); // Remove this specific index
                        }}
                        className="text-gray-500 hover:text-red-400 hover:bg-white/5 p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSlots.length > 1 && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300/90 rounded-2xl flex gap-2">
                <Sparkles size={14} className="shrink-0 text-indigo-405" />
                <p><strong>Convenience Tip:</strong> You are booking {selectedSlots.length} passes together. Pay once to receive all digital passes instantly!</p>
              </div>
            )}

            <div className="flex justify-between items-center bg-gray-800/50 rounded-2xl p-4">
              <span className="text-gray-400 font-medium">Total Bill</span>
              <span className="text-2xl font-black text-white">₹{(selectedSlots.length * venue.pricePerHour).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={selectedSlots.length === 0}
            className="group w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-500 py-4 text-base font-bold text-white transition-all hover:bg-indigo-400 active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 cursor-pointer"
          >
            Review & Pay
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-xs text-gray-400">
            <Info size={16} className="shrink-0 text-indigo-400" />
            <p>Full refund available if cancelled 2 hours before any session starts.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
