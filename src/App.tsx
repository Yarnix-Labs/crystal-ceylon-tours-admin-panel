import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AdminProviders } from "./admin/context/AdminProviders";
import ScrollToTop from "./components/ScrollToTop";
import PageLoader from "./components/PageLoader";


// Admin layout & pages — lazy-loaded
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/pages/Login"));
const ResetPassword = lazy(() => import("./admin/pages/ResetPassword"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const TourList = lazy(() => import("./admin/pages/tours/TourList"));
const TourForm = lazy(() => import("./admin/pages/tours/TourForm"));
const DestinationList = lazy(
  () => import("./admin/pages/destinations/DestinationList")
);
const DestinationForm = lazy(
  () => import("./admin/pages/destinations/DestinationForm")
);
const MediaLibrary = lazy(() => import("./admin/pages/MediaLibrary"));
const BlogPosts = lazy(() => import("./admin/pages/Blogs/BlogPosts"));
const BlogPostForm = lazy(() => import("./admin/pages/Blogs/BlogPostForm"));
const ThingsToDoList = lazy(
  () => import("./admin/pages/thingstodo/ThingsToDoList")
);
const ThingsToDoForm = lazy(
  () => import("./admin/pages/thingstodo/ThingsToDoForm")
);
const CustomerReviews = lazy(
  () => import("./admin/pages/CustomerReviews/CustomerReviews")
);
const CustomerReviewForm = lazy(
  () => import("./admin/pages/CustomerReviews/CustomerReviewForm")
);
const Profile = lazy(() => import("./admin/pages/Profile"));
const Settings = lazy(() => import("./admin/pages/Settings"));
const Notifications = lazy(() => import("./admin/pages/Notifications"));
const ContactMessages = lazy(
  () => import("./admin/pages/ContactMessages/ContactMessages")
);
const BookingInquiries = lazy(
  () => import("./admin/pages/BookingInquiries/BookingInquiries")
);
const CustomBookingInquiries = lazy(
  () => import("./admin/pages/CustomBookingInquiries/CustomBookingInquiries")
);
const EmailList = lazy(() => import("./admin/pages/EmailList")); // New page
const QuickBookings = lazy(() => import("./admin/pages/QuickBookings/QuickBookings"));
const SubmitReview = lazy(() => import("./pages/SubmitReview"));
const SupportDesk = lazy(() => import("./admin/pages/SupportDesk")); // Route not in use

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Redirect component for handling /admin/* to /dashboard/*
const AdminRedirect = () => {
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/admin/, "/dashboard") || "/dashboard";
  // Preserve query params and hash
  return <Navigate to={{ pathname, search: location.search, hash: location.hash }} replace />;
};

const isReviewSubdomain = 
  window.location.hostname.startsWith("review.") || 
  window.location.hostname === "review-crystalceylontours.local"; // Optional for local testing

const App = () => {
  if (isReviewSubdomain) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<SubmitReview />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AdminProviders>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/submit-review" element={<SubmitReview />} />
                
                {/* 🔐 ADMIN ROUTES */}
                <Route path="/" element={<AdminLogin />} />
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin/*" element={<AdminRedirect />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Dashboard Layout with nested routes */}
                <Route path="/dashboard" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  
                  {/* Tour Management */}
                  <Route path="tours" element={<TourList />} />
                  <Route path="tours/new" element={<TourForm />} />
                  <Route path="tours/:id" element={<TourForm />} />
                  
                  {/* Things To Do Management */}
                  <Route path="things-to-do" element={<ThingsToDoList />} />
                  <Route path="things-to-do/new" element={<ThingsToDoForm />} />
                  <Route path="things-to-do/:id" element={<ThingsToDoForm />} />
                  
                  {/* Destination Management */}
                  <Route path="destinations" element={<DestinationList />} />
                  <Route path="destinations/new" element={<DestinationForm />} />
                  <Route path="destinations/:id" element={<DestinationForm />} />
                  
                  {/* Blog Management */}
                  <Route path="blog" element={<BlogPosts />} />
                  <Route path="blog/new" element={<BlogPostForm />} />
                  <Route path="blog/:id" element={<BlogPostForm />} />
                  
                  {/* Media Library */}
                  <Route path="media" element={<MediaLibrary />} />
                  
                  {/* Customer Reviews */}
                  <Route path="reviews" element={<CustomerReviews />} />
                  <Route path="reviews/new" element={<CustomerReviewForm />} />
                  <Route path="reviews/:id" element={<CustomerReviewForm />} />
                  
                  {/* Communication */}
                  <Route path="messages" element={<ContactMessages />} />
                   <Route path="bookings" element={<BookingInquiries />} />
                   <Route path="custom-bookings" element={<CustomBookingInquiries />} />
                   <Route path="quick-bookings" element={<QuickBookings />} />
                   <Route path="email-list" element={<EmailList />} />
                  <Route path="support" element={<SupportDesk />} />
                  
                  {/* User Management */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>
              </Routes>
            </Suspense>
          </AdminProviders>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
