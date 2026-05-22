/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Venue, VENUES } from '../lib/mockData';

export interface Review {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

interface BookingContextType {
  bookings: Booking[];
  venues: Venue[];
  reviews: Review[];
  pendingBooking: Partial<Booking> | null;
  toast: string | null;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  updateVenue: (id: string, updatedFields: Partial<Venue>) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  setPending: (venueDetails: Partial<Booking>) => void;
  clearPending: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('mock_bookings');
    if (saved) return JSON.parse(saved);
    
    // Seed some highly interactive initial bookings (one upcoming today, one passed, and one tomorrow)
    return [
      {
        id: 'bk-101',
        userId: 'u1',
        venueId: 't1',
        venueName: 'Old Trafford Turf',
        venueType: 'turf',
        slot: '05:00 PM', // Later today
        date: 'Friday, 22 May 2026',
        totalAmount: 1200,
        status: 'confirmed',
        specialRequests: 'Please keep 6 bibs ready!'
      },
      {
        id: 'bk-102',
        userId: 'u1',
        venueId: 'g1',
        venueName: 'LXG Gaming Arena',
        venueType: 'gaming',
        slot: '09:00 AM', // Earlier today
        date: 'Friday, 22 May 2026',
        totalAmount: 150,
        status: 'confirmed',
        specialRequests: 'Pre-install CS2 on the PC please.'
      },
      {
        id: 'bk-103',
        userId: 'u1',
        venueId: 't2',
        venueName: 'The Box Cricket Cafe',
        venueType: 'turf',
        slot: '06:00 PM', // Tomorrow
        date: 'Saturday, 23 May 2026',
        totalAmount: 800,
        status: 'confirmed'
      }
    ];
  });
  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem('mock_venues');
    return saved ? JSON.parse(saved) : VENUES;
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('mock_reviews');
    return saved ? JSON.parse(saved) : [
      {
        id: 'r1',
        venueId: 't1',
        userId: 'u2',
        userName: 'Aarav Sharma',
        rating: 5,
        text: 'Out of this world! Pristine turf with amazing lighting. Feels like playing at a pro stadium.',
        date: '15 May 2026'
      },
      {
        id: 'r2',
        venueId: 't1',
        userId: 'u3',
        userName: 'Karan Mehra',
        rating: 4.6,
        text: 'Great showers and facilities. A bit expensive but 100% worth it for tournament practice.',
        date: '18 May 2026'
      },
      {
        id: 'r3',
        venueId: 't2',
        userId: 'u4',
        userName: 'Kabir Dev',
        rating: 4.5,
        text: 'Perfect net height and clean boundaries. The dugout has great shade and seats are comfy.',
        date: '12 May 2026'
      },
      {
        id: 'r4',
        venueId: 'g1',
        userId: 'u5',
        userName: 'Aditya Sen',
        rating: 5,
        text: 'Incredibly low ping and flawless 240Hz monitors. Best gaming arena in Mumbai!',
        date: '20 May 2026'
      },
      {
        id: 'r5',
        venueId: 'g2',
        userId: 'u6',
        userName: 'Riya Patel',
        rating: 4.6,
        text: 'Affordable rates, excellent PS5 area. The snacks in the lounge are fantastic!',
        date: '21 May 2026'
      }
    ];
  });
  const [pendingBooking, setPendingBooking] = useState<Partial<Booking> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mock_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('mock_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('mock_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const updateVenue = (id: string, updatedFields: Partial<Venue>) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
  };

  const addReview = (newReviewData: Omit<Review, 'id' | 'date'>) => {
    const newId = `rev-${Date.now()}`;
    const newDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const review: Review = {
      ...newReviewData,
      id: newId,
      date: newDate
    };

    setReviews((prev) => {
      const updated = [review, ...prev];
      // Recalculate average rating for this venue and update venues state
      const venueReviews = updated.filter(r => r.venueId === review.venueId);
      const avgRating = Number((venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length).toFixed(1));
      
      setVenues((prevVenues) => 
        prevVenues.map((v) => v.id === review.venueId ? { ...v, rating: avgRating } : v)
      );
      
      return updated;
    });
  };

  const setPending = (venueDetails: Partial<Booking>) => {
    setPendingBooking(venueDetails);
  };

  const clearPending = () => {
    setPendingBooking(null);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <BookingContext.Provider value={{ 
      bookings, 
      venues,
      reviews,
      pendingBooking, 
      toast,
      addBooking, 
      cancelBooking,
      updateVenue,
      addReview,
      setPending, 
      clearPending,
      showToast,
      hideToast
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
