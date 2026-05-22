/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/MockBookingContext';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Gamepad2, Trophy, Clock, SlidersHorizontal, IndianRupee, Search, ChevronDown, Map, Shield } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import VenueCard from '../components/VenueCard';

export default function Home() {
  const { venues } = useBooking();
  const [category, setCategory] = useState<'all' | 'turf' | 'gaming'>('all');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const ALL_AMENITIES = [
    'floodlights',
    'changing rooms',
    'Wi-Fi',
    'showers',
    'parking',
    'refreshments',
    'ac',
    'lounge',
    'gaming peripherals'
  ];

  const filteredVenues = useMemo(() => {
    let result = venues.filter((venue) => {
      const matchesCategory = category === 'all' || venue.type === category;
      const matchesPrice = venue.pricePerHour <= maxPrice;
      const matchesRating = venue.rating >= minRating;
      const matchesSearch = 
        venue.name.toLowerCase().includes(search.toLowerCase()) || 
        venue.location.toLowerCase().includes(search.toLowerCase());
      const matchesAmenities = selectedAmenities.length === 0 || 
        selectedAmenities.every(a => venue.amenities && venue.amenities.includes(a));
      
      return matchesCategory && matchesPrice && matchesRating && matchesSearch && matchesAmenities;
    });

    // Sort the results
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.pricePerHour - b.pricePerHour;
      if (sortBy === 'price-desc') return b.pricePerHour - a.pricePerHour;
      return 0;
    });

    return result;
  }, [category, maxPrice, minRating, search, sortBy, selectedAmenities]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
        >
          Book Your Next <span className="text-indigo-600">Legendary Session</span>
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          The ultimate hub for athletes and gamers. Premium turfs and high-end esports cafes at your fingertips.
        </p>
      </section>

      {/* Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:gap-8">
          {/* Search Bar */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={20} />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(['all', 'turf', 'gaming'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setCategory(type)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
                  category === type
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {type === 'turf' && <Trophy size={16} />}
                {type === 'gaming' && <Gamepad2 size={16} />}
                <span className="capitalize">{type}s</span>
              </button>
            ))}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold border transition-all ${
                showFilters 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters {(minRating > 0 || maxPrice < 1500 || selectedAmenities.length > 0) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">
                  {(minRating > 0 ? 1 : 0) + (maxPrice < 1500 ? 1 : 0) + (selectedAmenities.length > 0 ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-full border border-gray-100 bg-white py-3 pl-6 pr-10 text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer shadow-sm"
              >
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/40 p-6"
            >
              <div className="grid gap-6 md:grid-cols-3">
                {/* Price Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <IndianRupee size={16} className="text-indigo-600" />
                      Max Price (₹{maxPrice}/hr)
                    </label>
                    <button 
                      onClick={() => setMaxPrice(1500)}
                      className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>₹100</span>
                    <span>₹1500</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" />
                      Min Rating
                    </label>
                    <button 
                      onClick={() => setMinRating(0)}
                      className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all border ${
                          minRating === rating
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {rating === 0 ? 'All' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities Checkbox Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Shield size={16} className="text-indigo-600" />
                      Filter by Amenities
                    </label>
                    <button 
                      onClick={() => setSelectedAmenities([])}
                      className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {ALL_AMENITIES.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <label 
                          key={amenity} 
                          className="flex items-center gap-2 text-xs font-bold text-gray-650 hover:text-gray-900 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                              } else {
                                setSelectedAmenities(prev => [...prev, amenity]);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 accent-indigo-650"
                          />
                          <span className="capitalize text-[11px] truncate">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <p className="text-xs font-black text-gray-405 uppercase tracking-widest leading-none">
          Showing {filteredVenues.length} available arenas
        </p>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/40 select-none self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-650 shadow-sm'
                : 'text-gray-450 hover:text-gray-750'
            }`}
          >
            <SlidersHorizontal size={12} /> List View
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-indigo-650 shadow-sm'
                : 'text-gray-450 hover:text-gray-750'
            }`}
          >
            <Map size={12} /> Map View
          </button>
        </div>
      </div>

      {/* Venue Grid / Interactive Map View */}
      {filteredVenues.length > 0 ? (
        viewMode === 'map' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InteractiveMap venues={filteredVenues} />
          </motion.div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="h-full">
                <VenueCard venue={venue} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="py-20 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
            <SlidersHorizontal size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No venues match your filters</h3>
          <p className="text-gray-500 mt-2">Try adjusting your price range or rating threshold.</p>
          <button 
            onClick={() => { setMaxPrice(1500); setMinRating(0); setCategory('all'); }}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

