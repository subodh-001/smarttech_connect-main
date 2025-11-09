import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/NewAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import UserLogin from './pages/user-login';
import LiveTracking from './pages/live-tracking';
import UserDashboard from './pages/user-dashboard';
import ServiceRequestCreation from './pages/service-request-creation';
import TechnicianSelection from './pages/technician-selection';
import UserRegistration from './pages/user-registration';
import UserProfile from './pages/user-profile';
import HelpCenter from './pages/help-center';
import TechnicianDashboard from './pages/technician-dashboard';
import TechnicianOnboarding from './pages/technician-onboarding';
import AdminDashboard from './pages/admin-dashboard';
import BookingManagement from './pages/booking-management';
import ChatCommunication from './pages/chat-communication';
import ProtectedRoute from "./components/ProtectedRoute";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/live-tracking" element={<ProtectedRoute allowedRoles={["user"]}><LiveTracking /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
        <Route path="/service-request-creation" element={<ProtectedRoute allowedRoles={["user"]}><ServiceRequestCreation /></ProtectedRoute>} />
        <Route path="/technician-selection" element={<ProtectedRoute allowedRoles={["user"]}><TechnicianSelection /></ProtectedRoute>} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/user-profile" element={<ProtectedRoute allowedRoles={["user","technician"]}><UserProfile /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute allowedRoles={["user","technician"]}><UserProfile /></ProtectedRoute>} />
        <Route path="/technician-onboarding" element={<TechnicianOnboarding />} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["user","technician"]}><UserProfile /></ProtectedRoute>} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/booking-management" element={<ProtectedRoute allowedRoles={["user"]}><BookingManagement /></ProtectedRoute>} />
        <Route path="/technician-dashboard" element={<ProtectedRoute allowedRoles={["technician"]}><TechnicianDashboard /></ProtectedRoute>} />
        <Route path="/chat-communication" element={<ProtectedRoute><ChatCommunication /></ProtectedRoute>} />
        <Route
          path="/profile-management"
          element={<Navigate to="/user-profile" replace />}
        />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  let target = '/user-login';
  if (user) {
    const roleRaw = user.role || user.type;
    const role = roleRaw === 'customer' ? 'user' : roleRaw;
    switch (role) {
      case 'user':
        target = '/user-dashboard';
        break;
      case 'technician':
        target = '/technician-dashboard';
        break;
      case 'admin':
        target = '/admin-dashboard';
        break;
      default:
        target = '/user-dashboard';
    }
  }
  return <Navigate to={target} replace />;
};