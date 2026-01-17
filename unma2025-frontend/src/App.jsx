import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loading from "./components/ui/Loading";
import AdminLayout from "./components/layout/AdminLayout";
import BasicLayout from "./components/layout/BasicLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRedirect from "./components/auth/AdminRedirect";
import Header, { FloatingCreditButton } from "./components/layout/Header";
// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Registration = lazy(() => import("./pages/Registration"));
const QuickRegistration = lazy(() =>
  import("./components/registration/QuickRegistration")
);
const Gallery = lazy(() => import("./pages/Gallery"));
// const Success = lazy(() => import("./pages/Success"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminRegistrations = lazy(() => import("./pages/admin/Registrations"));
const CreateRegistration = lazy(() =>
  import("./pages/admin/CreateRegistration")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Issues = lazy(() => import("./pages/admin/Issues"));
const ContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const UserLogs = lazy(() => import("./pages/admin/UserLogs"));
const PaymentHistory = lazy(() => import("./pages/admin/paymentHistory"));
const AccommodationManagement = lazy(() =>
  import("./pages/admin/AccommodationManagement")
);
const TransportationManagement = lazy(() =>
  import("./pages/admin/TransportationManagement")
);
const FeedbackManagement = lazy(() =>
  import("./pages/admin/FeedbackManagement")
);
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const RegistrationPendingSuccess = lazy(() =>
  import("./pages/RegistrationPendingSuccess")
);
const RegistrationPending = lazy(() =>
  import("./components/registration/RegistrationPending")
);
const Contact = lazy(() => import("./pages/Contact"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
import ReportIssue from "./pages/ReportIssue";
import { useAuthStore } from "./store";
import AlumniUpdate from "./pages/AlumniUpdate";
import RegistrationEntry from "./pages/RegistrationEntry";
import ProtectedRouteRegister from "./components/auth/ProtectedRout-register";
const Feedback = lazy(() => import("./pages/Feedback"));
const RepublicDayEvent = lazy(() => import("./pages/RepublicDayEvent"));
const RepublicDayEventSuccess = lazy(() =>
  import("./pages/RepublicDayEventSuccess")
);

function App() {
  const { logout, user, isSuperAdmin, isRegistrationDesk } = useAuthStore();
  useEffect(() => {
    console.log(isRegistrationDesk);
  }, [isRegistrationDesk]);
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<BasicLayout />}>
                <Route path="/" element={<Home />} />
                {/* <Route path="/registration" element={<Registration />} />
                <Route path="/register" element={<Registration />} /> */}
                {/* <Route
                  path="/quick-registration"
                  element={<QuickRegistration />}
                /> */}
                <Route path="/gallery" element={<Gallery />} />
                {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
                {/* <Route
                  path="/registration-success"
                  element={<RegistrationSuccess />}
                />
                <Route
                  path="/registration-pending-success?type=:type"
                  element={<RegistrationPendingSuccess />}
                /> */}
                <Route
                  path="/registration-pending"
                  element={<RegistrationPending />}
                />
                <Route path="/report-issue" element={<ReportIssue />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/terms-and-conditions"
                  element={<TermsAndConditions />}
                />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route
                  path="/cancellation-policy"
                  element={<CancellationPolicy />}
                />
                <Route path="/alumni-update" element={<AlumniUpdate />} />
                <Route path="/feedback/:id" element={<Feedback />} />
                <Route
                  path="/republic-day-event"
                  element={<RepublicDayEvent />}
                />
                <Route
                  path="/republic-day-event/success"
                  element={<RepublicDayEventSuccess />}
                />
              </Route>
              {/* Registration Entry Route (Protected but accessible via QR) */}
              {/* Registration Entry Route (Protected for Registration Desk) */}

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminRedirect />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="registrations" element={<AdminRegistrations />} />
                {isSuperAdmin && (
                  <>
                    <Route
                      path="accommodation"
                      element={<AccommodationManagement />}
                    />
                    <Route
                      path="transportation"
                      element={<TransportationManagement />}
                    />
                  </>
                )}

                <>
                  <Route
                    path="create-registration"
                    element={<CreateRegistration />}
                  />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="issues" element={<Issues />} />
                  <Route
                    path="contact-messages"
                    element={<ContactMessages />}
                  />
                  <Route path="user-logs" element={<UserLogs />} />
                  <Route path="payment-history" element={<PaymentHistory />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="feedback" element={<FeedbackManagement />} />
                  <Route path="entry" element={<RegistrationEntry />} />
                </>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <FloatingCreditButton />
      </div>
    </Router>
  );
}

export default App;
