import { Link } from "react-router-dom";
import { FIFA_PUBLIC_ENABLED } from "../config/features";
import {
  ClipboardDocumentListIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  HomeModernIcon,
  IdentificationIcon,
  QrCodeIcon,
  TruckIcon,
  UserGroupIcon,
  CreditCardIcon,
  TrophyIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const DEMO_ADMIN_EMAIL =
  import.meta.env.VITE_DEMO_ADMIN_EMAIL || "admin@example.com";
const DEMO_ADMIN_PASSWORD =
  import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "securePassword123";

const sections = [
  {
    id: "public",
    title: "Public attendee journey",
    subtitle: "What registrants see and submit",
    items: [
      {
        label: "Summit registration",
        description: "Multi-step alumni / staff / other registration form",
        to: "/registration",
        external: false,
      },
      {
        label: "Quick registration",
        description: "Short-form registration for on-the-spot sign-ups",
        to: "/quick-registration",
        external: false,
      },
      {
        label: "Republic Day event",
        description: "Live event registration with activity selections",
        to: "/republic-day-event",
        external: false,
      },
      {
        label: "Post-event feedback (admin)",
        description: "Review submitted attendee feedback and ratings",
        to: "/admin/feedback",
        external: false,
        admin: true,
      },
    ],
  },
  {
    id: "admin",
    title: "Admin operations",
    subtitle: "Staff tools for running the event — login required",
    items: [
      {
        label: "Admin login",
        description: "Sign in with demo credentials below",
        to: "/admin/login",
        external: false,
      },
      {
        label: "Summit dashboard",
        description: "Registration totals, charts, and KPI overview",
        to: "/admin/dashboard",
        external: false,
        admin: true,
      },
      {
        label: "Registrations list",
        description: "Search, filter, and export all registrations",
        to: "/admin/registrations",
        external: false,
        admin: true,
      },
      {
        label: "Create registration",
        description: "Manually add a registration from the admin desk",
        to: "/admin/create-registration",
        external: false,
        admin: true,
      },
      {
        label: "Accommodation matching",
        description: "Providers, seekers, hotel requests, and compatibility",
        to: "/admin/accommodation",
        external: false,
        admin: true,
      },
      {
        label: "Transportation coordination",
        description: "Ride-share groups, routes, and travel stats",
        to: "/admin/transportation",
        external: false,
        admin: true,
      },
      {
        label: "ID card generation",
        description: "Preview, download PNG/PDF, and bulk ZIP export",
        to: "/admin/id-cards",
        external: false,
        admin: true,
      },
      {
        label: "Registration desk",
        description: "Check-in attendees at the venue entry gate",
        to: "/admin/entry",
        external: false,
        admin: true,
      },
      {
        label: "Payment history",
        description: "Razorpay and manual payment records",
        to: "/admin/payment-history",
        external: false,
        admin: true,
      },
      {
        label: "Analytics",
        description: "Deep-dive registration and attendance analytics",
        to: "/admin/analytics",
        external: false,
        admin: true,
      },
    ],
  },
  {
    id: "engagement",
    title: "Engagement",
    subtitle: "Optional add-ons beyond core event logistics",
    items: [
      {
        label: "FIFA predictions",
        description: "Match prediction contest with leaderboard",
        to: "/fifa",
        external: false,
      },
      {
        label: "FIFA bracket",
        description: "Knockout bracket prediction game",
        to: "/fifa/bracket",
        external: false,
      },
      {
        label: "FIFA admin",
        description: "Manage slots, results, and participants",
        to: "/admin/fifa",
        external: false,
        admin: true,
      },
    ],
  },
];

const DemoCard = ({ item }) => (
  <Link
    to={item.to}
    className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-teal-600/40 hover:bg-gray-50/80"
  >
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
      <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-teal-700" />
    </div>
    <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500">
      {item.description}
    </p>
    {item.admin && (
      <span className="mt-3 inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ring-sky-600/20 bg-sky-50 text-sky-700">
        Admin login required
      </span>
    )}
    {item.note && (
      <p className="mt-2 text-[11px] text-amber-700">{item.note}</p>
    )}
  </Link>
);

const sectionIcons = {
  public: ClipboardDocumentListIcon,
  admin: QrCodeIcon,
  engagement: TrophyIcon,
};

const DemoHub = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
          Client demo
        </p>
        <h1 className="mt-1 text-lg font-semibold text-gray-900">
          Event management platform — feature showcase
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          One hub for registration, accommodation, transportation, ID cards,
          check-in desk, payments, and engagement modules. Start here and
          click through each card.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Demo admin login</h2>
        <p className="mt-1 text-xs text-gray-500">
          Use these credentials at{" "}
          <Link to="/admin/login" className="text-teal-700 hover:underline">
            /admin/login
          </Link>{" "}
          before opening admin cards. Run{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[11px]">
            npm run seed:demo
          </code>{" "}
          in the backend if the account or sample data is missing.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">Email</dt>
            <dd className="font-mono text-gray-900">{DEMO_ADMIN_EMAIL}</dd>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">Password</dt>
            <dd className="font-mono text-gray-900">{DEMO_ADMIN_PASSWORD}</dd>
          </div>
        </dl>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Registration", icon: UserGroupIcon },
          { label: "Accommodation", icon: HomeModernIcon },
          { label: "Transport", icon: TruckIcon },
          { label: "ID cards", icon: IdentificationIcon },
          { label: "Desk check-in", icon: QrCodeIcon },
          { label: "Payments", icon: CreditCardIcon },
          { label: "Analytics", icon: ChartBarIcon },
          { label: "Feedback", icon: ChatBubbleBottomCenterTextIcon },
          { label: "Engagement", icon: BoltIcon },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700"
          >
            <Icon className="h-4 w-4 text-gray-400" />
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {sections.map((section) => {
          const SectionIcon = sectionIcons[section.id] || CalendarDaysIcon;
          const items = FIFA_PUBLIC_ENABLED
            ? section.items
            : section.items.filter((item) => !item.to.startsWith("/fifa"));
          if (items.length === 0) return null;
          return (
            <section key={section.id}>
              <div className="mb-4 flex items-center gap-2">
                <SectionIcon className="h-5 w-5 text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-xs text-gray-500">{section.subtitle}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <DemoCard key={item.to + item.label} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default DemoHub;
