import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ArrowLeft } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import FanHomePage from './pages/FanHomePage';
import LiveAlertsPage from './pages/LiveAlertsPage';
import AccessibilityPage from './pages/AccessibilityPage';
import TransportPlannerPage from './pages/TransportPlannerPage';
import StaffReportPage from './pages/StaffReportPage';
import AlertApprovalPage from './pages/AlertApprovalPage';
import AdminVenuePage from './pages/AdminVenuePage';
import SettingsPage from './pages/SettingsPage';
import TellProblemPage from './pages/TellProblemPage';

// Lazy loaded pages
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const SmartNavigationPage = lazy(() => import('./pages/SmartNavigationPage'));
const FoodDrinksPage = lazy(() => import('./pages/FoodDrinksPage'));
const StaffDashboardPage = lazy(() => import('./pages/StaffDashboardPage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import LoadingState from './components/LoadingState';

// Route guard
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primaryDark flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-400 animate-pulse">Authenticating session...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home = ['volunteer', 'staff', 'organizer'].includes(user.role) ? '/staff-dashboard' : '/fan-home';
    return <Navigate to={home} replace />;
  }

  return children;
}

// Wrapper that reads auth context and renders appropriate shell
function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Scroll to top when route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    // Close mobile sidebar on navigation
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const isPublicRoute = ['/', '/login'].includes(location.pathname);
  const isStaff = user && ['volunteer', 'staff', 'organizer'].includes(user.role);
  const showBackButton = !['/fan-home', '/staff-dashboard', '/organizer-command', '/login', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-primaryDark flex flex-col">
      {/* Only show navbar on authenticated pages */}
      {!isPublicRoute && (
        <Navbar
          showHamburger={isStaff}
          onHamburgerClick={() => setMobileSidebarOpen(prev => !prev)}
        />
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {/* Staff sidebar — desktop persistent, mobile overlay drawer */}
        {!isPublicRoute && isStaff && (
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar overlay backdrop */}
        {!isPublicRoute && isStaff && mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main scrollable content area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-6 min-h-0 w-0">
          {showBackButton && (
            <div className="mb-3 md:mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md w-fit cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            </div>
          )}
          <Suspense fallback={<LoadingState />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected query page */}
              <Route path="/tell-problem" element={<ProtectedRoute><TellProblemPage /></ProtectedRoute>} />

              {/* Fan-only routes */}
              <Route path="/fan-home" element={<ProtectedRoute allowedRoles={['fan']}><FanHomePage /></ProtectedRoute>} />
              <Route path="/smart-navigation" element={<ProtectedRoute allowedRoles={['fan']}><SmartNavigationPage /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={['fan']}><AIAssistantPage /></ProtectedRoute>} />
              <Route path="/live-alerts" element={<ProtectedRoute allowedRoles={['fan']}><LiveAlertsPage /></ProtectedRoute>} />
              <Route path="/accessibility" element={<ProtectedRoute allowedRoles={['fan']}><AccessibilityPage /></ProtectedRoute>} />
              <Route path="/transport-exit" element={<ProtectedRoute allowedRoles={['fan']}><TransportPlannerPage /></ProtectedRoute>} />
              <Route path="/food-drinks" element={<ProtectedRoute allowedRoles={['fan']}><FoodDrinksPage /></ProtectedRoute>} />

              {/* Staff / Volunteer routes */}
              <Route path="/staff-dashboard" element={<ProtectedRoute allowedRoles={['volunteer', 'staff', 'organizer']}><StaffDashboardPage /></ProtectedRoute>} />
              <Route path="/staff-report" element={<ProtectedRoute allowedRoles={['volunteer', 'staff', 'organizer']}><StaffReportPage /></ProtectedRoute>} />
              <Route path="/alert-approval" element={<ProtectedRoute allowedRoles={['staff', 'organizer']}><AlertApprovalPage /></ProtectedRoute>} />
              <Route path="/organizer-command" element={<ProtectedRoute allowedRoles={['organizer']}><CommandCenterPage /></ProtectedRoute>} />
              <Route path="/admin-venue" element={<ProtectedRoute allowedRoles={['organizer']}><AdminVenuePage /></ProtectedRoute>} />

              {/* Shared authenticated route */}
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={
                <Navigate to={user ? (isStaff ? '/staff-dashboard' : '/fan-home') : '/'} replace />
              } />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Fan mobile bottom nav */}
      {!isPublicRoute && user && !isStaff && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <AppShell />
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}
