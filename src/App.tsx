/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/MockAuthContext';
import { BookingProvider } from './context/MockBookingContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Lazy loading pages for cleaner presentation
import Home from './pages/Home';
import Login from './pages/Login';
import VenueDetails from './pages/VenueDetails';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import VenueAdmin from './pages/VenueAdmin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/venue/:id" element={<ProtectedRoute><VenueDetails /></ProtectedRoute>} />
                <Route path="/venue/:id/admin" element={<ProtectedRoute><VenueAdmin /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/partner" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
            <Toast />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}
