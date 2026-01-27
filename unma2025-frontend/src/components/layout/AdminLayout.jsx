import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChatBubbleBottomCenterTextIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../store/authStore";
import { useAdminStore } from "../../store";
import logo from "../../assets/logo.png";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Use our custom hooks
  const { logout, user, isSuperAdmin, isCareerAdmin } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAdminStore();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const canViewAnalytics = user?.permissions?.canViewAnalytics !== false; // Default to true
  const canManageSettings =
    user?.permissions?.canManageSettings || isSuperAdmin;

  // Get school-specific label for school admins
  const getSchoolLabel = () => {
    if (!isSuperAdmin && user?.assignedSchools?.length > 0) {
      if (user.assignedSchools.length === 1) {
        return user.assignedSchools[0];
      } else {
        return `${user.assignedSchools.length} Schools`;
      }
    }
    return "UNMA 2026";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-dark">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex-col justify-center items-center space-y-2">
              <img src={logo} alt="UNMA 2026" className="w-20 h-7" />
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md md:hidden hover:bg-primary-dark"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {/* <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="/admin/registrations"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <UserGroupIcon className="w-5 h-5 mr-3" />
                <span>Registrations</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/entry"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <DocumentTextIcon className="w-5 h-5 mr-3" />
                <span>Entry</span>
              </Link>
            </li> */}
            
            {/* Events Section */}
            {user?.role !== "career_admin" && (
              <>
                <li className="pt-2">
                  <div className="px-2 pb-1 text-xs uppercase text-primary-light opacity-75">
                    Events
                  </div>
                </li>
                <li>
                  <Link
                    to="/admin/republic-day-event/dashboard"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    <span>Event Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/republic-day-event/registrations"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <UserGroupIcon className="w-5 h-5 mr-3" />
                    <span>Event Registrations</span>
                  </Link>
                </li>
                {isSuperAdmin && (
                  <li>
                    <Link
                      to="/admin/events"
                      className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                    >
                      <CalendarDaysIcon className="w-5 h-5 mr-3" />
                      <span>Event Management</span>
                    </Link>
                  </li>
                )}
              </>
            )}
            
            {/* Website Content Section */}
            {(isSuperAdmin || isCareerAdmin) && (
              <>
                <li className="pt-4">
                  <div className="px-2 pb-1 text-xs uppercase text-primary-light opacity-75">
                    Website Content
                  </div>
                </li>
                {isSuperAdmin && (
                  <>
                    <li>
                      <Link
                        to="/admin/team"
                        className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                      >
                        <UserGroupIcon className="w-5 h-5 mr-3" />
                        <span>Team Management</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/updates"
                        className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                      >
                        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-3" />
                        <span>Updates Management</span>
                      </Link>
                    </li>
                  </>
                )}
                {(isCareerAdmin || isSuperAdmin) && (
                  <li>
                    <Link
                      to="/admin/jobs"
                      className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                    >
                      <BriefcaseIcon className="w-5 h-5 mr-3" />
                      <span>Careers / Jobs</span>
                    </Link>
                  </li>
                )}
              </>
            )}
            
            {/* {isSuperAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/accommodation"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-3 4h1m-1 4h1"
                      />
                    </svg>
                    <span>Accommodation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/transportation"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-3.375c0-.621.504-1.125 1.125-1.125h2.25c0 .621.504 1.125 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125zM21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                    <span>Transportation</span>
                  </Link>
                </li>
              </>
            )} */}
            {/* {canViewAnalytics && (
              <li>
                <Link
                  to="/admin/analytics"
                  className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                >
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  <span>Analytics</span>
                </Link>
              </li>
            )} */}

            {/* User Communications Section */}
            {canManageSettings && (
              <>
                <li className="pt-4">
                  <div className="px-2 pb-1 text-xs uppercase text-primary-light opacity-75">
                    User Communications
                  </div>
                </li>
                <li>
                  <Link
                    to="/admin/feedback"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-3" />
                    <span>Feedback</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/issues"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 mr-3" />
                    <span>Issues</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/contact-messages"
                    className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                  >
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-3" />
                    <span>Contact Messages</span>
                  </Link>
                </li>
              </>
            )}

            {/* {isSuperAdmin && (
              <li>
                <Link
                  to="/admin/payment-history"
                  className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-3" />
                  <span>Payment History</span>
                </Link>
              </li>
            )} */}

            {/* System Section */}
            {(canManageSettings || isSuperAdmin) && (
              <>
                <li className="pt-4">
                  <div className="px-2 pb-1 text-xs uppercase text-primary-light opacity-75">
                    System
                  </div>
                </li>
                {canManageSettings && (
                  <li>
                    <Link
                      to="/admin/settings"
                      className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3" />
                      <span>Settings</span>
                    </Link>
                  </li>
                )}
                {isSuperAdmin && (
                  <li>
                    <Link
                      to="/admin/user-logs"
                      className="flex items-center p-2 rounded-md hover:bg-primary-dark"
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-3" />
                      <span>User Logs</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-md hover:bg-primary-dark"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md md:hidden hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <div className="flex justify-end w-full">
              <div className="mr-2 text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin"}
                </div>
                <div className="text-xs text-gray-500">
                  {isSuperAdmin ? "Super Admin" : user?.role}
                  {!isSuperAdmin && user?.assignedSchools?.length > 0 && (
                    <span className="ml-1">
                      ({user.assignedSchools.length} school
                      {user.assignedSchools.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium">
                  {user?.name?.charAt(4)?.toUpperCase() || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
          <footer className=" shadow-sm z-10">
            <div className="px-4 py-3 flex items-center justify-center">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} UNMA . All rights reserved. |
                Proudly connecting alumni across generations.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
