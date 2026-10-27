import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Loader } from './components/common/Loader';
import { CitySelector } from './components/cities/CitySelector';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Movies = lazy(() => import('./pages/Movies').then(m => ({ default: m.Movies })));
const MovieDetails = lazy(() => import('./pages/MovieDetails').then(m => ({ default: m.MovieDetails })));
const SeatSelection = lazy(() => import('./pages/SeatSelection').then(m => ({ default: m.SeatSelection })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation').then(m => ({ default: m.BookingConfirmation })));
const MyBookings = lazy(() => import('./pages/MyBookings').then(m => ({ default: m.MyBookings })));
const Cinemas = lazy(() => import('./pages/Cinemas').then(m => ({ default: m.Cinemas })));
const Offers = lazy(() => import('./pages/Offers').then(m => ({ default: m.Offers })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function App() {
  return (
    <>
      <Navbar />
      <CitySelector />

      <main>
        <Suspense fallback={<Loader size="large" text="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:idOrSlug" element={<MovieDetails />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Booking Flow (requires selection, some optionally protected) */}
            <Route path="/shows/:showId/seats" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Booking Confirmation Routes */}
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/booking/:bookingId/confirmation" element={<BookingConfirmation />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export default App;
