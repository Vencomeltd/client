import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./PrivateRoute";
import {
  ProtectedRoute,
  HostRoute,
  CustomerRoute,
  AdminRoute,
} from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import CookieConsentBanner from "./components/CookieConsentBanner";
import SupportAccessBanner from "./components/SupportAccessBanner";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPassword from "./pages/ForgotPassword";
import Impersonate from "./pages/Impersonate";
import SupportAccessGrantScreen from "./pages/SupportAccessGrantScreen";
import Dashboard from "./pages/Dashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Homepage from "./pages/Homepage";
import PropertyDetails from "./pages/PropertyDetails";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import CreateSpace from "./pages/CreateSpace";
import EditSpace from "./pages/EditSpace";
import MyListings from "./pages/MyListings";
import HostProfile from "./pages/HostProfile";
import CategoryPage from "./pages/CategoryPage";
import HostBookings from "./pages/HostBookings";
import HostCalendar from "./pages/HostCalendar";
import MyBookings from "./pages/MyBookings";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import SearchPage from "./pages/SearchPage";
import ChatPage from "./pages/ChatPage";
import Conversation from "./pages/Conversation";
import ConversationPage from "./pages/ConversationPage";
import FAQ from "./pages/FAQ";
import TermsAndConditions from "./pages/TermsAndConditions";
import HelpSupport from "./pages/HelpSupport";
import PropertyAvailability from "./pages/PropertyAvailability";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import BookingDetails from "./pages/BookingDetails";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Partners from "./pages/Partners";
import HelpCenter from "./pages/HelpCenter";
import SafetyInformation from "./pages/SafetyInformation";
import CancellationOptions from "./pages/CancellationOptions";
import ContactUs from "./pages/ContactUs";
import Accessibility from "./pages/Accessibility";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Sitemap from "./pages/Sitemap";
import MyReviews from "./pages/MyReviews";
import SavedSpaces from "./pages/SavedSpaces";
import Analytics from "./pages/Analytics";
import CategoryComingSoon from "./pages/CategoryComingSoon";
import ReferHost from "./pages/ReferHost";

// QueryClient lives OUTSIDE the component tree — never recreated on re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/search" ||
    location.pathname.startsWith("/property/") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/customer") ||
    location.pathname.startsWith("/host/") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/bookings/") ||
    location.pathname.startsWith("/availability/") ||
    location.pathname === "/my-bookings" ||
    location.pathname.startsWith("/chat") ||
    location.pathname === "/create-space" ||
    location.pathname.startsWith("/edit-space/") ||
    location.pathname === "/my-listings" ||
    location.pathname === "/property-availability" ||
    location.pathname === "/about" ||
    location.pathname === "/careers" ||
    location.pathname === "/press" ||
    location.pathname === "/partners" ||
    location.pathname === "/help-center" ||
    location.pathname === "/help" ||
    location.pathname === "/safety" ||
    location.pathname === "/cancellation-options" ||
    location.pathname === "/contact" ||
    location.pathname === "/accessibility" ||
    location.pathname === "/faq" ||
    location.pathname === "/privacy" ||
    location.pathname === "/terms-and-conditions" ||
    location.pathname === "/sitemap" ||
    location.pathname === "/blogs" ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/settings");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer position="top-right" autoClose={4000} />
      <ScrollToTop />
      <SupportAccessBanner />
      <CookieConsentBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/impersonate" element={<Impersonate />} />
        <Route path="/support-access/:token" element={<SupportAccessGrantScreen />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/host/:id" element={<HostProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category-coming-soon/:categoryName" element={<CategoryComingSoon />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/safety" element={<SafetyInformation />} />
        <Route path="/cancellation-options" element={<CancellationOptions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/refer" element={<ReferHost />} />

        {/* Auth required */}
        <Route
          path="/dashboard"
          element={
            <HostRoute>
              <Dashboard />
            </HostRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <CustomerRoute>
              <CustomerDashboard section="overview" />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <CustomerRoute>
              <MyBookings />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/saved"
          element={
            <PrivateRoute>
              <SavedSpaces />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/messages"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/messages/:id"
          element={
            <PrivateRoute>
              <ConversationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/reviews"
          element={
            <PrivateRoute>
              <MyReviews />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <PrivateRoute>
              <CustomerDashboard section="profile" />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/settings"
          element={
            <PrivateRoute>
              <CustomerDashboard section="settings" />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/bookings"
          element={
            <PrivateRoute>
              <HostBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/messages"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/messages/:id"
          element={
            <PrivateRoute>
              <ConversationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <PrivateRoute>
              <Navigate to="/profile" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <PrivateRoute>
              <Navigate to="/settings" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/saved"
          element={
            <PrivateRoute>
              <SavedSpaces />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/reviews"
          element={
            <PrivateRoute>
              <MyReviews />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/*"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/*"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <HostRoute>
              <MyBookings />
            </HostRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <PrivateRoute>
              <Conversation />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* Host required */}
        <Route
          path="/create-space"
          element={
            <HostRoute>
              <CreateSpace />
            </HostRoute>
          }
        />
        <Route
          path="/edit-space/:id"
          element={
            <HostRoute>
              <EditSpace />
            </HostRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <PrivateRoute requireHost>
              <BookingDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <HostRoute>
              <MyListings />
            </HostRoute>
          }
        />
        <Route
          path="/host/listings"
          element={
            <PrivateRoute requireHost>
              <MyListings />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/create"
          element={
            <PrivateRoute>
              <CreateSpace />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/analytics"
          element={
            <PrivateRoute requireHost>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <PrivateRoute requireHost>
              <HostBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/calendar"
          element={
            <PrivateRoute requireHost>
              <HostCalendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/property-availability"
          element={
            <HostRoute>
              <PropertyAvailability />
            </HostRoute>
          }
        />
        <Route
          path="/host/availability/:listingId"
          element={
            <PrivateRoute requireHost>
              <PropertyAvailability />
            </PrivateRoute>
          }
        />
        <Route
          path="/availability/:id/availability"
          element={
            <PrivateRoute requireHost>
              <PropertyAvailability />
            </PrivateRoute>
          }
        />

        {/* Admin required */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
