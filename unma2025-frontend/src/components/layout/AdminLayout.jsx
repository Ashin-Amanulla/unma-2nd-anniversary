import { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  FlagIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../store/authStore";
import { useAdminStore } from "../../store";
import logo from "../../assets/logo.png";

const RepublicDayIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
    />
  </svg>
);

const SidebarGroup = ({ group, isExpanded, onToggle, onNavigate, pathname }) => {
  if (!group.items.length) return null;

  const hasActiveChild = group.items.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  );

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
          hasActiveChild
            ? "bg-white/15 text-white"
            : "text-white/90 hover:bg-white/10"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <group.icon className="h-5 w-5 shrink-0 opacity-90" />
          <span className="truncate">{group.label}</span>
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 opacity-80 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden">
          <div className="space-y-0.5 py-1 pl-3">
            {group.items.map((item) => {
              const isActive =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg py-2 pl-8 pr-3 text-sm transition-colors ${
                      isActive
                        ? "bg-white text-primary font-medium shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </div>
        </ul>
      </div>
    </li>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isSuperAdmin, isCareerAdmin, isFifaAdmin } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAdminStore();
  const [expandedGroups, setExpandedGroups] = useState({});

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const canManageSettings =
    user?.permissions?.canManageSettings || isSuperAdmin;

  const hasSidebarAccess = (itemKey) => {
    if (isSuperAdmin) return true;

    if (!user?.sidebarAccess || user.sidebarAccess.length === 0) {
      return null;
    }

    return user.sidebarAccess.includes(itemKey);
  };

  const canShow = (itemKey, roleDefault) => {
    const access = hasSidebarAccess(itemKey);
    if (access === true) return true;
    if (access === false) return false;
    return roleDefault;
  };

  const menuGroups = useMemo(() => {
    const groups = [
      {
        id: "live-events",
        label: "Live events",
        icon: FlagIcon,
        items: [
          canShow("event_dashboard", user?.role !== "career_admin") && {
            key: "event_dashboard",
            label: "Registration dashboard",
            to: "/admin/republic-day-event/dashboard",
            icon: RepublicDayIcon,
          },
          canShow("event_registrations", user?.role !== "career_admin") && {
            key: "event_registrations",
            label: "Event registrations",
            to: "/admin/republic-day-event/registrations",
            icon: UserGroupIcon,
          },
        ].filter(Boolean),
      },
      {
        id: "website",
        label: "Website content",
        icon: GlobeAltIcon,
        items: [
          canShow("team_management", isSuperAdmin) && {
            key: "team_management",
            label: "Coordination team",
            to: "/admin/team",
            icon: UserGroupIcon,
          },
          canShow("updates_management", isSuperAdmin) && {
            key: "updates_management",
            label: "News & updates",
            to: "/admin/updates",
            icon: ChatBubbleLeftEllipsisIcon,
          },
          canShow("webinars_management", isSuperAdmin) && {
            key: "webinars_management",
            label: "Webinars",
            to: "/admin/webinars",
            icon: VideoCameraIcon,
          },
          canShow("event_management", isSuperAdmin) && {
            key: "event_management",
            label: "Event timeline",
            to: "/admin/events",
            icon: CalendarDaysIcon,
          },
        ].filter(Boolean),
      },
      {
        id: "careers",
        label: "Careers",
        icon: BriefcaseIcon,
        items: [
          canShow("careers_jobs", isCareerAdmin || isSuperAdmin) && {
            key: "careers_jobs",
            label: "Job listings",
            to: "/admin/jobs",
            icon: BriefcaseIcon,
          },
          canShow("pending_jobs", isCareerAdmin || isSuperAdmin) && {
            key: "pending_jobs",
            label: "Pending approvals",
            to: "/admin/pending-jobs",
            icon: ClockIcon,
          },
        ].filter(Boolean),
      },
      {
        id: "communications",
        label: "Communications",
        icon: ChatBubbleBottomCenterTextIcon,
        items: [
          canShow("feedback", canManageSettings) && {
            key: "feedback",
            label: "Feedback",
            to: "/admin/feedback",
            icon: ChatBubbleBottomCenterTextIcon,
          },
          canShow("issues", canManageSettings) && {
            key: "issues",
            label: "Reported issues",
            to: "/admin/issues",
            icon: ExclamationTriangleIcon,
          },
          canShow("contact_messages", canManageSettings) && {
            key: "contact_messages",
            label: "Contact inbox",
            to: "/admin/contact-messages",
            icon: ChatBubbleLeftEllipsisIcon,
          },
        ].filter(Boolean),
      },
      {
        id: "engagement",
        label: "Engagement",
        icon: SparklesIcon,
        items: [
          canShow("fifa", isFifaAdmin || isSuperAdmin) && {
            key: "fifa",
            label: "FIFA Predictions",
            to: "/admin/fifa",
            icon: TrophyIcon,
          },
        ].filter(Boolean),
      },
      {
        id: "system",
        label: "System",
        icon: WrenchScrewdriverIcon,
        items: [
          canShow("settings", canManageSettings) && {
            key: "settings",
            label: "Settings",
            to: "/admin/settings",
            icon: Cog6ToothIcon,
          },
          canShow("user_logs", isSuperAdmin) && {
            key: "user_logs",
            label: "Activity logs",
            to: "/admin/user-logs",
            icon: DocumentTextIcon,
          },
        ].filter(Boolean),
      },
    ];

    return groups.filter((group) => group.items.length > 0);
  }, [user, isSuperAdmin, isCareerAdmin, isFifaAdmin, canManageSettings]);

  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some(
        (item) =>
          location.pathname === item.to ||
          location.pathname.startsWith(`${item.to}/`)
      )
    );

    if (activeGroup) {
      setExpandedGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [location.pathname, menuGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-primary text-white transition-transform duration-300 ease-in-out md:static md:inset-0 md:translate-x-0`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-primary-dark p-4">
          <img src={logo} alt="UNMA 2026" className="h-7 w-20" />
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1 hover:bg-primary-dark md:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col">
          <ul className="flex-1 space-y-1 overflow-y-auto p-3 pb-24">
            {menuGroups.map((group) => (
              <SidebarGroup
                key={group.id}
                group={group}
                pathname={location.pathname}
                isExpanded={Boolean(expandedGroups[group.id])}
                onToggle={() => toggleGroup(group.id)}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </ul>

          <div className="shrink-0 border-t border-primary-dark p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg p-2.5 text-sm hover:bg-primary-dark"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-md p-1 hover:bg-gray-100 md:hidden"
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="ml-auto flex items-center">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <span className="text-xs font-medium">
                  {user?.name?.charAt(4)?.toUpperCase() || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <Outlet />
          <footer className="z-10 shadow-sm">
            <div className="flex items-center justify-center px-4 py-3">
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
