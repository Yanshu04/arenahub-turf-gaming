# 🏟️ ArenaHub: Turf & Gaming

[![React Version](https://img.shields.io/badge/react-v19.0-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4.0-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/vite-v6.0-646cff.svg?style=flat-square&logo=vite)](https://vite.dev/)
[![Framer Motion](https://img.shields.io/badge/motion-v12.0-ff007f.svg?style=flat-square&logo=framer)](https://motion.dev/)
[![Recharts](https://img.shields.io/badge/recharts-v3.8-22c55e.svg?style=flat-square&logo=chartjs)](https://recharts.org/)

**ArenaHub** is an ultra-modern, high-fidelity sports turf and esports gaming cafe booking application. Engineered with a premium desktop-first responsive aesthetic, it bridges the gap between active sports lovers and digital gamers. ArenaHub offers an effortless booking system, robust partner analytics, and an elegant playground user experience.

---

## ✨ Features

### 1. 🔍 Interactive Discovery & Amenity-Based Filters
* **Rich Card Carousels**: Venues feature stateful, auto-advancing slide carousels showcasing high-quality arena gallery images.
* **Granular Amenity Filtering**: Easily search for facilities offering specific requirements like **Floodlights**, **Changing Rooms**, **Wi-Fi**, or **High-End Gaming Peripherals**.
* **Live Status**: Real-time opening/closing status calculations based on the venue's active hours.

### 2. 📅 Multi-Pass Booking Engine (Custom Calendar)
* **Custom Infinite Calendar**: A handcrafted, interactive monthly view showing real-time slot availability (Fully Booked, Available, and Past Days).
* **Multi-Slot Selection**: Book multiple non-sequential slots across different days and sessions, consolidated into a convenient "Multi-Pass" checkout basket.
* **Instant Pricing Calculations**: Automatic fee bundling with a responsive and clear price breakdown.

### 3. 💳 Sleek Checkout & Special Requests
* Includes specialized form options for custom messages or notes for the venue host (special equipment, tournament rules, etc.).
* Dynamic card payment simulation with micro-interaction loaders.

### 4. 👤 Interactive Player Dashboard
* **Upcoming Booking Status**: Real-time date and time status verification (automatically switches status labels to `Completed` or `Expired` post-reservation).
* **Advance Reminders**: Toggle-enabled reminder system with custom head-start selectors (1, 2, or 3 hours before start time).
* **Digital Check-In**: Stateful simulate-ready QR codes for seamless check-in control.

### 5. 📊 Partner Analytics & Performance Portal
* **Live Financial Analytics**: Real-time tracking of *Total Bookings*, *Total Revenue Generated*, *Average Ticket Value*, and *Active Facilities Managed*.
* **Peak Booking Hours Chart**: A beautifully customized **Recharts Bar Chart** showing booking distributions from 6:00 AM to 11:00 PM (with easy toggling between facilities).

### 6. ❤️ Community & Feedback Loops
* Stateful customer reviews and star rating system.
* Smooth stagger-in review list entry animations driven by the **Framer Motion (`motion`)** spring presets.

---

## 🛠️ Technological Stack

* **Front-End Library**: React 19 (Functional Components, Hooks, Context API)
* **Programming Language**: TypeScript (Strict Type Safety)
* **Styling**: Tailwind CSS (with utility-first custom-theme color pairings)
* **Data Visualization**: Recharts (Custom SVG Bar charts and modern tooltips)
* **Animations**: Framer Motion (`motion/react`)
* **Icons**: Lucide React
* **Build System & Dev Server**: Vite

---

## 🚀 Getting Started

### Prerequisites

* Ensure you have [Node.js](https://nodejs.org/) installed (v18.0 or higher is recommended).
* A package manager like `npm` (comes standard with Node.js).

### Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/arenahub.git
   cd arenahub
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional, copy template if needed):
   ```bash
   cp .env.example .env
   ```

4. **Launch the local development server**:
   ```bash
   npm run dev
   ```
   *The server will boot up and be accessible locally at `http://localhost:3000`.*

5. **Build the application for production**:
   ```bash
   npm run build
   ```
   *Compiles a pristine, production-ready bundle inside the `dist/` workspace.*

---

## 📂 Key Architecture Outline

```text
├── src/
│   ├── components/            # Shared structural widgets (Navbar, Toast, Venue Cards)
│   ├── context/               # Global state contexts (MockAuthContext, MockBookingContext)
│   ├── lib/                   # Pre-seeded static lists and Type Declarations (mockData)
│   ├── pages/                 # Full screen layouts
│   │   ├── Home.tsx           # Discover hub, interactive map, search & filter
│   │   ├── VenueDetails.tsx   # Custom calendar, reviews, multi-pass booking
│   │   ├── Checkout.tsx       # Dynamic payment screen & special notes 
│   │   ├── Dashboard.tsx      # User passes, checklist QR, reminder controls
│   │   └── PartnerDashboard.tsx # Portal stats & peak booking Recharts
│   ├── index.css              # Global styles & Tailwind configuration
│   └── main.tsx               # Entry mount
├── tsconfig.json              # TypeScript compilation rules
└── vite.config.ts             # Bundler plugins
```

---

## 🔒 License

Distributed under the Apache-2.0 License. See the boilerplate declaration headers inside source modules for specifics.
