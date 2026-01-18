import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import republicDayEventApi from "../../api/republicDayEventApi";
import {
  UserGroupIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  MusicalNoteIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
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

const RepublicDayEventDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await republicDayEventApi.getStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Build stats cards
  const buildStatCards = () => {
    if (!stats) return [];

    return [
      {
        title: "Total Registrations",
        value: stats.totalRegistrations || 0,
        icon: UserGroupIcon,
        color: "bg-blue-500",
        subtext: "Republic Day Event",
      },
      {
        title: "Vegetarian",
        value: stats.vegCount || 0,
        icon: SparklesIcon,
        color: "bg-green-500",
        subtext: `${stats.nonVegCount || 0} Non-Veg`,
      },
      {
        title: "Blood Donation",
        value: stats.bloodDonationCount || 0,
        icon: HeartIcon,
        color: "bg-red-500",
        subtext: "Volunteers",
      },
      {
        title: "National Song",
        value: stats.nationalSongCount || 0,
        icon: MusicalNoteIcon,
        color: "bg-purple-500",
        subtext: "Participants",
      },
      {
        title: "Boat Ride",
        value: stats.boatRideCount || 0,
        icon: SparklesIcon,
        color: "bg-cyan-500",
        subtext: "Interested",
      },
      {
        title: "Volunteers",
        value: stats.volunteerCount || 0,
        icon: HandRaisedIcon,
        color: "bg-orange-500",
        subtext: "Ready to help",
      },
      {
        title: "WhatsApp Group",
        value: stats.whatsAppGroupCount || 0,
        icon: UserGroupIcon,
        color: "bg-green-600",
        subtext: "Members",
      },
      {
        title: "Total Amount",
        value: `₹${(stats.totalAmountPaid || 0).toLocaleString()}`,
        icon: CurrencyRupeeIcon,
        color: "bg-indigo-500",
        subtext: `Avg: ₹${Math.round(stats.avgAmountPaid || 0)}`,
      },
    ];
  };

  // JNV School chart data
  const jnvChartData = {
    labels: (stats?.registrationsByJNV || []).slice(0, 10).map((item) => item._id || "Unknown"),
    datasets: [
      {
        label: "Registrations",
        data: (stats?.registrationsByJNV || []).slice(0, 10).map((item) => item.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Food preference chart data
  const foodChartData = {
    labels: ["Vegetarian", "Non-Vegetarian"],
    datasets: [
      {
        data: [stats?.vegCount || 0, stats?.nonVegCount || 0],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
        borderWidth: 1,
      },
    ],
  };

  // Payment method chart data
  const paymentChartData = {
    labels: (stats?.paymentMethodDistribution || []).map(
      (item) => item._id || "Not Specified"
    ),
    datasets: [
      {
        data: (stats?.paymentMethodDistribution || []).map((item) => item.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
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
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Republic Day Event Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of January 26th event registrations
          </p>
        </div>
        <Link
          to="/admin/republic-day-event/registrations"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Registrations
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {buildStatCards().map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JNV Schools Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Registrations by JNV School (Top 10)
              </h3>
              <div className="h-[300px]">
                <Bar data={jnvChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Food Preference Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Food Preference Distribution
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-[250px] h-[250px]">
                  <Pie data={foodChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method Distribution
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-[250px] h-[250px]">
                  <Pie data={paymentChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Participation Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participation Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Registrations</span>
                  <span className="font-semibold text-blue-600">
                    {stats?.totalRegistrations || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">Blood Donation Volunteers</span>
                  <span className="font-semibold text-red-600">
                    {stats?.bloodDonationCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">National Song Participants</span>
                  <span className="font-semibold text-purple-600">
                    {stats?.nationalSongCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-gray-700">Boat Ride Interested</span>
                  <span className="font-semibold text-cyan-600">
                    {stats?.boatRideCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Volunteers</span>
                  <span className="font-semibold text-orange-600">
                    {stats?.volunteerCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700">Total Amount Collected</span>
                  <span className="font-semibold text-indigo-600">
                    ₹{(stats?.totalAmountPaid || 0).toLocaleString()}
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

export default RepublicDayEventDashboard;
