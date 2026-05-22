/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Venue {
  id: string;
  name: string;
  type: 'turf' | 'gaming';
  pricePerHour: number;
  image: string;
  images: string[];
  rating: number;
  location: string;
  description: string;
  amenities: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  venueName: string;
  venueType: string;
  slot: string;
  date: string;
  totalAmount: number;
  status: 'confirmed' | 'pending';
  specialRequests?: string;
  isMultiPass?: boolean;
  multiSlots?: { dateStr: string; slot: string; price: number }[];
}

export const VENUES: Venue[] = [
  {
    id: 't1',
    name: 'Old Trafford Turf',
    type: 'turf',
    pricePerHour: 1200,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1431324155629-1a6edd1d1523?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    location: 'Bandra West, Mumbai',
    description: 'FIFA approved 5-a-side football turf with premium floodlights and shower facilities.',
    amenities: ['floodlights', 'changing rooms', 'Wi-Fi', 'showers', 'parking', 'refreshments']
  },
  {
    id: 't2',
    name: 'The Box Cricket Cafe',
    type: 'turf',
    pricePerHour: 800,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510137600163-2729bc6959a6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595152230535-09795b602357?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.5,
    location: 'Andheri East, Mumbai',
    description: 'Perfect for box cricket and 6-a-side football. Includes a cozy refreshment corner.',
    amenities: ['floodlights', 'changing rooms', 'parking', 'refreshments']
  },
  {
    id: 'g1',
    name: 'LXG Gaming Arena',
    type: 'gaming',
    pricePerHour: 150,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    location: 'Powai, Mumbai',
    description: 'Elite gaming cafe featuring RTX 4080 PCs, 240Hz monitors, and premium racing sims.',
    amenities: ['Wi-Fi', 'gaming peripherals', 'ac', 'lounge', 'refreshments']
  },
  {
    id: 'g2',
    name: 'Pixel Play Hub',
    type: 'gaming',
    pricePerHour: 100,
    image: 'https://images.unsplash.com/photo-162464313914c-1d0722cc0191?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-162464313914c-1d0722cc0191?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.6,
    location: 'Vile Parle, Mumbai',
    description: 'Affordable yet professional gaming environment with PS5 and high-end PC setups.',
    amenities: ['Wi-Fi', 'gaming peripherals', 'ac', 'lounge']
  }
];

export const MOCK_SLOTS: TimeSlot[] = [
  { id: '1', time: '09:00 AM', isAvailable: true },
  { id: '2', time: '10:00 AM', isAvailable: true },
  { id: '3', time: '11:00 AM', isAvailable: false },
  { id: '4', time: '12:00 PM', isAvailable: true },
  { id: '5', time: '01:00 PM', isAvailable: false },
  { id: '6', time: '02:00 PM', isAvailable: true },
  { id: '7', time: '05:00 PM', isAvailable: true },
  { id: '8', time: '06:00 PM', isAvailable: true },
  { id: '9', time: '07:00 PM', isAvailable: true },
  { id: '10', time: '08:00 PM', isAvailable: true },
  { id: '11', time: '09:00 PM', isAvailable: true },
  { id: '12', time: '10:00 PM', isAvailable: true },
];
