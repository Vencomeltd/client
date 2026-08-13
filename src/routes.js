import { index, route, layout } from "@react-router/dev/routes";

export default [
  // Phase 3: public, data-fetching pages -- each has its own loader/meta.
  index("pages/Homepage.jsx"),
  route("property/:id", "pages/PropertyDetails.jsx"),
  route("blog", "pages/BlogList.jsx"),
  route("blogs", "pages/BlogList.jsx", { id: "blog-alias" }),
  route("blog/:slug", "pages/BlogDetails.jsx"),
  route("search", "pages/SearchPage.jsx"),

  // Public pages that relied on App.jsx's old outer <Navbar/> wrapping
  // (not self-contained the way StaticPageLayout/FAQ pages are) -- see
  // routes/layouts/public-navbar.jsx.
  layout("routes/layouts/public-navbar.jsx", [
    route("category/:id", "pages/CategoryPage.jsx"),
    route("host/:id", "pages/HostProfile.jsx"),
    route("help-support", "pages/HelpSupport.jsx"),
  ]),

  // Phase 2: static public pages -- no data fetching, each already
  // self-contains its own Navbar/Footer (via StaticPageLayout or directly).
  route("about", "pages/About.jsx"),
  route("careers", "pages/Careers.jsx"),
  route("press", "pages/Press.jsx"),
  route("partners", "pages/Partners.jsx"),
  route("help-center", "pages/HelpCenter.jsx"),
  route("help", "pages/HelpCenter.jsx", { id: "help-center-alias" }),
  route("safety", "pages/SafetyInformation.jsx"),
  route("cancellation-options", "pages/CancellationOptions.jsx"),
  route("contact", "pages/ContactUs.jsx"),
  route("accessibility", "pages/Accessibility.jsx"),
  route("faq", "pages/FAQ.jsx"),
  route("privacy", "pages/PrivacyPolicy.jsx"),
  route("terms-and-conditions", "pages/TermsAndConditions.jsx"),
  route("sitemap", "pages/Sitemap.jsx"),
  route("category-coming-soon/:categoryName", "pages/CategoryComingSoon.jsx"),
  route("refer", "pages/ReferHost.jsx"),

  // Auth-flow pages -- no guard, no SEO value, unchanged components.
  route("login", "pages/LoginPage.jsx"),
  route("signup", "pages/SignupPage.jsx"),
  route("forgot-password", "pages/ForgotPassword.jsx"),
  route("impersonate", "pages/Impersonate.jsx"),
  route("support-access/:token", "pages/SupportAccessGrantScreen.jsx"),
  route("admin/login", "pages/AdminLogin.jsx"),

  // Phase 4: private/authenticated routes -- client-only (no loader),
  // grouped by which guard they need. Guard components and page
  // components are unchanged; only the registration format is new.
  layout("routes/layouts/private.jsx", [
    route("customer/saved", "pages/SavedSpaces.jsx"),
    route("customer/messages", "pages/ChatPage.jsx"),
    route("customer/messages/:id", "pages/ConversationPage.jsx"),
    route("customer/reviews", "pages/MyReviews.jsx"),
    route("customer/profile", "routes/customer-dashboard-profile.jsx"),
    route("customer/settings", "routes/customer-dashboard-settings.jsx"),
    route("dashboard/bookings", "pages/HostBookings.jsx"),
    route("dashboard/messages", "pages/ChatPage.jsx", { id: "dashboard-messages" }),
    route("dashboard/messages/:id", "pages/ConversationPage.jsx", { id: "dashboard-conversation" }),
    route("dashboard/profile", "routes/redirect-to-profile.jsx"),
    route("dashboard/settings", "routes/redirect-to-settings.jsx"),
    route("dashboard/saved", "pages/SavedSpaces.jsx", { id: "dashboard-saved" }),
    route("dashboard/reviews", "pages/MyReviews.jsx", { id: "dashboard-reviews" }),
    route("settings/*", "pages/Settings.jsx"),
    route("profile/*", "pages/Profile.jsx"),
    route("chat", "pages/ChatPage.jsx", { id: "chat-root" }),
    route("chat/:conversationId", "pages/Conversation.jsx"),
    route("notifications", "pages/Notifications.jsx"),
    route("host/create", "pages/CreateSpace.jsx", { id: "host-create-private" }),
  ]),

  layout("routes/layouts/private-host.jsx", [
    route("bookings/:id", "pages/BookingDetails.jsx"),
    route("host/listings", "pages/MyListings.jsx"),
    route("host/analytics", "pages/Analytics.jsx"),
    route("host/bookings", "pages/HostBookings.jsx", { id: "host-bookings-requirehost" }),
    route("host/calendar", "pages/HostCalendar.jsx"),
    route("host/availability/:listingId", "pages/PropertyAvailability.jsx"),
    route("availability/:id/availability", "pages/PropertyAvailability.jsx", { id: "availability-alt" }),
  ]),

  layout("routes/layouts/host-route.jsx", [
    route("dashboard", "pages/Dashboard.jsx"),
    route("my-bookings", "pages/MyBookings.jsx"),
    route("create-space", "pages/CreateSpace.jsx", { id: "create-space-hostroute" }),
    route("edit-space/:id", "pages/EditSpace.jsx"),
    route("my-listings", "pages/MyListings.jsx", { id: "my-listings-hostroute" }),
    route("property-availability", "pages/PropertyAvailability.jsx", { id: "property-availability-hostroute" }),
  ]),

  layout("routes/layouts/customer-route.jsx", [
    route("customer/dashboard", "routes/customer-dashboard-overview.jsx"),
    route("customer/bookings", "pages/MyBookings.jsx", { id: "customer-bookings" }),
  ]),

  layout("routes/layouts/admin-route.jsx", [
    route("admin", "pages/AdminDashboard.jsx"),
  ]),

  route("*", "pages/NotFound.jsx"),
];
