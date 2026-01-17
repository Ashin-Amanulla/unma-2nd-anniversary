import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useAdmin } from "../../hooks/useAdmin";
import {
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtext,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {tooltip && (
              <div className="relative ml-1">
                <InformationCircleIcon
                  className="h-4 w-4 text-gray-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute z-10 w-64 p-2 text-xs bg-gray-800 text-white rounded shadow-lg -left-32 mt-1">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const {
    dashboardStats,
    isLoadingStats,
    useAnalytics,
    useRazorpayPaymentsBySchool,
  } = useAdmin();
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useAnalytics();
  const { data: razorpayPaymentsResponse, isLoading: isLoadingRazorpay } =
    useRazorpayPaymentsBySchool();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  // Check if user is super admin
  const isSuperAdmin = user?.role === "super_admin";

  // Build stats array - only 4 tiles in 2x2 layout
  const buildStats = () => {
    // Get the total amount from Razorpay data if available
    const razorpayTotalAmount =
      razorpayPaymentsResponse?.data?.totalAmount || 0;

    const baseStats = [
      {
        title: "Successful Registrations",
        value: dashboardStats?.successfulPayments || 0,
        icon: ClipboardDocumentCheckIcon,
        color: "bg-green-500",
        subtext: "Completed payments",
      },
      {
        title: "Total Attendees",
        value: dashboardStats?.totalAttendees || 0,
        icon: UserGroupIcon,
        color: "bg-purple-500",
        subtext: "Including family members",
      },
      {
        title: "Total Funds Received",
        value: `₹${(
          razorpayTotalAmount ||
          dashboardStats?.totalFundCollected ||
          0
        ).toLocaleString()}`,
        icon: CurrencyRupeeIcon,
        color: "bg-blue-500",
        subtext: "From Razorpay payments",
        tooltip:
          "Amount shown is from Razorpay dashboard and will be reduced after deducting taxes and service charges.",
      },
      {
        title: "Pending Registrations",
        value: dashboardStats?.pendingPayments || 0,
        icon: ClipboardDocumentCheckIcon,
        color: "bg-yellow-500",
        subtext: "Awaiting payment",
      },
    ];

    return baseStats;
  };

  const stats = buildStats();

  // Chart data - Top 5 JNV schools with successful registrations and attendee count
  const schoolData = analyticsData?.data?.schoolWise || [];
  const top5Schools = schoolData.slice(0, 5);

  const chartData = {
    labels: top5Schools.map((school) => school.school || "Unknown School"),
    datasets: [
      {
        label: "Successful Registrations",
        data: top5Schools.map((school) => school.successfulRegistrations || 0),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
      {
        label: "Total Attendees",
        data: top5Schools.map((school) => school.totalAttendees || 0),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgb(139, 92, 246)",
        borderWidth: 1,
      },
      {
        label: "Children < 6 years Count",
        data: top5Schools.map((school) => school.toddlersCount || 0),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        color: "#374151",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: function (value) {
          return value;
        },
      },
    },
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin
            ? "Here's what's happening with your registrations today."
            : `Here's what's happening with registrations from your assigned schools.`}
        </p>
        {!isSuperAdmin && user?.assignedSchools?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {user.assignedSchools.map((school) => (
              <span
                key={school}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {school}
              </span>
            ))}
          </div>
        )}
      </div>

      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, index) => (
              <DashboardCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 JNV Schools Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 5 JNV Associations - Registrations, Attendees & Children
                below 6 years
              </h3>
              {isLoadingAnalytics ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <Bar
                    data={chartData}
                    options={chartOptions}
                    plugins={[ChartDataLabels]}
                  />
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Successful Registrations
                  </span>
                  <span className="font-semibold text-green-600">
                    {dashboardStats?.successfulPayments ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Attendees</span>
                  <span className="font-semibold text-purple-600">
                    {dashboardStats?.totalAttendees || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center">
                    <span className="text-gray-600">Total Funds Received</span>
                    <div className="relative ml-1">
                      <InformationCircleIcon
                        className="h-4 w-4 text-gray-400 cursor-help"
                        title="Amount shown is from Razorpay dashboard and will be reduced after deducting taxes and service charges."
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">
                    ₹
                    {(
                      razorpayPaymentsResponse?.data?.totalAmount ||
                      dashboardStats?.totalFundCollected ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                {/* Anonymous contributions section */}
                {/* <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-md">
                  <span className="text-gray-700">Anonymous Contributions</span>
                  <span className="font-semibold text-indigo-600">
                    ₹
                    {(() => {
                      // Find payments without associated school information
                      const anonymousAmount =
                        razorpayPaymentsResponse?.data?.schoolStats?.find(
                          (s) => s.school === "Unknown"
                        )?.totalAmount || 0;
                      return anonymousAmount.toLocaleString();
                    })()}
                  </span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Registrations</span>
                  <span className="font-semibold text-yellow-600">
                    {dashboardStats?.pendingPayments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">
                    Average Fund per Attendee
                  </span>
                  <span className="font-semibold text-blue-600">
                    ₹
                    {Math.round(
                      (razorpayPaymentsResponse?.data?.totalAmount ||
                        dashboardStats?.totalFundCollected ||
                        0) / (dashboardStats?.totalAttendees || 1)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
