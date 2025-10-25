import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfileForm from "./pages/DoctorProfileForm";
import BookingApproval from "./pages/BookingApproval";
import React from "react";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfileForm from "./pages/PatientProfileForm";
import BookAppointment from "./pages/BookAppointments";
import NotFound from "./pages/NotFound";
import AppointmentsOverview from "./pages/AppointmentsOverview";
import EmergencyRequests from "./pages/EmergencyRequests";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin-dashboard" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'PATIENT':
        return <Navigate to="/patient-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <Landing />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/reset-password" element={
      <ProtectedRoute>
        <ResetPassword />
      </ProtectedRoute>
    } />
    <Route path="/register" element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Register />
      </ProtectedRoute>
    } />
    <Route path="/admin-dashboard" element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/doctor-dashboard" element={
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <DoctorDashboard />
      </ProtectedRoute>
    } />
    <Route path="/doctor/profile" element={
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <DoctorProfileForm />
      </ProtectedRoute>
    } />
    <Route path="/doctor/bookings" element={
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <BookingApproval />
      </ProtectedRoute>
    } />
    <Route path="/doctor/appointments" element={
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <AppointmentsOverview />
      </ProtectedRoute>
    } />
    <Route path="/appointments-overview" element={
      <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ADMIN']}>
        <AppointmentsOverview />
      </ProtectedRoute>
    } />
    <Route path="/patient-dashboard" element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <PatientDashboard />
      </ProtectedRoute>
    } />
    <Route path="/patient/profile" element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <PatientProfileForm />
      </ProtectedRoute>
    } />
    <Route path="/patient/book" element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <BookAppointment />
      </ProtectedRoute>
    } />
    <Route path="/book-appointment" element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <BookAppointment />
      </ProtectedRoute>
    } />
    <Route path="/patient/appointments" element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <AppointmentsOverview />
      </ProtectedRoute>
    } />
    <Route path="/emergency-requests" element={
      <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
        <EmergencyRequests />
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
