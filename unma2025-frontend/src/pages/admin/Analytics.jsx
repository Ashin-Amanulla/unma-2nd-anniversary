import React, { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  CurrencyDollarIcon,
  HomeIcon,
  HandRaisedIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  IdentificationIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
import Loading from "../../components/ui/Loading";
import { BarChart3Icon } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement
);

// Reusable stat card component with improved design
const StatCard = ({ title, value, icon: Icon, color }) => {
  // Map color prop to specific background and text colors
  const getColorClasses = (colorName) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-500",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-500",
        border: "border-green-200",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-500",
        border: "border-yellow-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-500",
        border: "border-purple-200",
      },
      red: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-500",
        border: "border-indigo-200",
      },
    };
    return (
      colorMap[colorName] || {
        bg: "bg-gray-50",
        text: "text-gray-500",
        border: "border-gray-200",
      }
    );
  };

  const { bg, text, border } = getColorClasses(color);

  return (
    <div
      className={`${bg} p-5 rounded-lg shadow-sm border ${border} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bg}`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
      </div>
    </div>
  );
};

// Improved category tab component
const CategoryTab = ({ id, title, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center px-4 py-3 rounded-md transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="w-5 h-5 mr-2" />
    <span className="font-medium">{title}</span>
  </button>
);

const Analytics = () => {
  const [activeCategory, setActiveCategory] = useState("registration_overview");
  const [isExporting, setIsExporting] = useState(false);
  const {
    useAnalytics,
    useDistrictAnalytics,
    usePaymentAnalytics,
    useRazorpayPaymentsBySchool,
    exportAllRegistrations,
  } = useAdmin();
  const { data: analyticsResponse, isLoading, error } = useAnalytics();
  const { data: districtAnalyticsResponse, isLoading: isLoadingDistrict } =
    useDistrictAnalytics();
  const { data: paymentAnalyticsResponse, isLoading: isLoadingPayment } =
    usePaymentAnalytics();
  const { data: razorpayPaymentsResponse, isLoading: isLoadingRazorpay } =
    useRazorpayPaymentsBySchool();
  const { isAuthenticated, isSuperAdmin } = useAuthStore();

  // Extract data from the responses
  const data = analyticsResponse?.data;
  const districtData = districtAnalyticsResponse?.data;
  const paymentData = paymentAnalyticsResponse?.data;
  const razorpayData = razorpayPaymentsResponse?.data;

  // Show error state if data loading failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Error Loading Analytics
              </h3>
              <p className="text-red-600 mt-1">
                {error.message ||
                  "Failed to load analytics data. Please try again."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Data for various statistics
  const totalRegistrations =
    (data?.registrationTypeCount?.alumni || 0) +
    (data?.registrationTypeCount?.staff || 0) +
    (data?.registrationTypeCount?.other || 0);

  // Use Razorpay data for total revenue if available, otherwise fall back to the old data
  const totalRevenue = razorpayData?.totalAmount || data?.totalAmount || 0;

  // Get completed payments count from Razorpay if available
  const completedPaymentsCount =
    razorpayData?.totalPayments || data?.paymentStatusCount?.completed || 0;

  // Summary statistics cards
  const statCards = [
    {
      title: "Total Registrations",
      value: totalRegistrations,
      icon: IdentificationIcon,
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "green",
    },
    {
      title: "Alumni Count",
      value: data?.registrationTypeCount?.alumni || 0,
      icon: AcademicCapIcon,
      color: "yellow",
    },
    {
      title: "Completed Payments",
      value: completedPaymentsCount,
      icon: BanknotesIcon,
      color: "purple",
    },
  ];

  // Category tabs for different analytics views
  const allCategoryTabs = [
    {
      id: "registration_overview",
      title: "Registration Overview",
      icon: ChartBarIcon,
    },
    // {
    //   id: "district_wise",
    //   title: "District Analysis",
    //   icon: BuildingOfficeIcon,
    // },
    {
      id: "school_participation",
      title: "School Distribution",
      icon: AcademicCapIcon,
    },
    {
      id: "successful_participation",
      title: "Overall Successful Registration Distribution",
      icon: BarChart3Icon,
    },
    {
      id: "payment_status",
      title: "Payment Status",
      icon: BanknotesIcon,
    },

    // Super admin only tabs
    {
      id: "need_accommodation",
      title: "Need Accommodation",
      icon: HomeIcon,
      superAdminOnly: true,
    },
    {
      id: "volunteers",
      title: "Volunteers",
      icon: HandRaisedIcon,
      superAdminOnly: false,
    },
    {
      id: "ride_share",
      title: "Ride Share",
      icon: TruckIcon,
      superAdminOnly: true,
    },
    {
      id: "sponsors",
      title: "Potential Sponsors",
      icon: UserGroupIcon,
      superAdminOnly: true,
    },
  ];

  // Filter category tabs based on user role
  const categoryTabs = allCategoryTabs.filter(
    (tab) => !tab.superAdminOnly || isSuperAdmin
  );

  // Redirect to safe tab if user is viewing super admin-only tab but not super admin
  React.useEffect(() => {
    const currentTab = allCategoryTabs.find((tab) => tab.id === activeCategory);
    if (currentTab?.superAdminOnly && !isSuperAdmin) {
      setActiveCategory("registration_overview");
    }
  }, [isSuperAdmin, activeCategory]);

  // Chart data preparations with better colors
  const chartColors = {
    blue: "rgba(59, 130, 246, 0.7)",
    green: "rgba(16, 185, 129, 0.7)",
    yellow: "rgba(245, 158, 11, 0.7)",
    purple: "rgba(139, 92, 246, 0.7)",
    red: "rgba(239, 68, 68, 0.7)",
    indigo: "rgba(79, 70, 229, 0.7)",
    pink: "rgba(236, 72, 153, 0.7)",
    teal: "rgba(20, 184, 166, 0.7)",
  };

  const schoolData = {
    labels: data?.schoolWise?.map((s) => s.school) || [],
    datasets: [
      {
        label: "Successful Registrations",
        data: data?.schoolWise?.map((s) => s.successfulRegistrations) || [],
        backgroundColor: chartColors.green,
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Attendees",
        data: data?.schoolWise?.map((s) => s.totalAttendees) || [],
        backgroundColor: chartColors.purple,
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Children < 6 years Count",
        data: data?.schoolWise?.map((s) => s.toddlersCount) || [],
        backgroundColor: chartColors.yellow,
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 1,
      },
    ],
  };

  const registrationTypeData = {
    labels: ["Alumni", "Staff", "Other"],
    datasets: [
      {
        data: [
          data?.registrationTypeCount?.alumni || 0,
          data?.registrationTypeCount?.staff || 0,
          data?.registrationTypeCount?.other || 0,
        ],
        backgroundColor: [
          chartColors.blue,
          chartColors.green,
          chartColors.yellow,
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentStatusData = {
    labels: ["Completed", "Financial Difficulty"],
    datasets: [
      {
        data: [
          data?.paymentStatusCount?.completed || 0,
          data?.paymentStatusCount?.pending || 0,
        ],
        backgroundColor: [chartColors.green, chartColors.yellow],
        borderWidth: 1,
      },
    ],
  };

  // Chart data preparations with enhanced district data
  const districtChartData = {
    labels: (districtData || data?.districtWise)?.map((d) => d.district) || [],
    datasets: [
      {
        label: "Total Registrations",
        data:
          (districtData || data?.districtWise)?.map(
            (d) => d.totalRegistrations || d.count
          ) || [],
        backgroundColor: chartColors.blue,
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      ...(districtData
        ? [
            {
              label: "Alumni",
              data: districtData.map((d) => d.alumniCount) || [],
              backgroundColor: chartColors.green,
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
            {
              label: "Attending",
              data: districtData.map((d) => d.attendingCount) || [],
              backgroundColor: chartColors.purple,
              borderColor: "rgba(139, 92, 246, 1)",
              borderWidth: 1,
            },
          ]
        : []),
    ],
  };

  const paymentChartData = {
    labels: ["Completed", "Financial Difficulty"],
    datasets: [
      {
        data: [
          data?.paymentStatusCount?.completed || 0,
          data?.paymentStatusCount?.pending || 0,
        ],
        backgroundColor: [chartColors.green, chartColors.yellow],
        borderWidth: 1,
      },
    ],
  };

  if (!isAuthenticated) return null;

  // Function to convert data to CSV and download
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data available to download");
      return;
    }

    // Get headers from the first item
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download current category data
  const downloadCurrentCategoryData = () => {
    const currentTab = categoryTabs.find((c) => c.id === activeCategory);
    let dataToDownload = [];
    let filename = "";

    switch (activeCategory) {
      case "need_accommodation":
        dataToDownload = data?.need_accommodation || [];
        filename = "need_accommodation";
        break;
      case "volunteers":
        dataToDownload = data?.volunteers || [];
        filename = "volunteers";
        break;
      case "ride_share":
        dataToDownload = data?.ride_share || [];
        filename = "ride_share";
        break;
      case "sponsors":
        dataToDownload = data?.sponsors || [];
        filename = "sponsors";
        break;
      default:
        // For overview categories, create summary data
        if (activeCategory === "registration_overview") {
          dataToDownload = [
            { metric: "Total Registrations", value: totalRegistrations },
            {
              metric: "Alumni Count",
              value: data?.registrationTypeCount?.alumni || 0,
            },
            {
              metric: "Staff Count",
              value: data?.registrationTypeCount?.staff || 0,
            },
            {
              metric: "Other Count",
              value: data?.registrationTypeCount?.other || 0,
            },
            {
              metric: "Completed Payments",
              value: data?.paymentStatusCount?.completed || 0,
            },
            {
              metric: "Financial Difficulty",
              value: data?.paymentStatusCount?.pending || 0,
            },
            { metric: "Total Revenue", value: totalRevenue },
          ];
          filename = "registration_overview";
        } else if (
          activeCategory === "school_participation" ||
          activeCategory === "successful_participation"
        ) {
          dataToDownload = data?.schoolWise || [];
          filename = "school_wise_data";
        } else if (activeCategory === "payment_status") {
          dataToDownload = [
            {
              status: "Completed",
              count: data?.paymentStatusCount?.completed || 0,
            },
            {
              status: "Financial Difficulty",
              count: data?.paymentStatusCount?.pending || 0,
            },
          ];
          filename = "payment_status";
        }
        break;
    }

    if (dataToDownload.length > 0) {
      downloadCSV(dataToDownload, filename);
    } else {
      alert("No data available to download for this category");
    }
  };

  // Function to download all registrations data
  const downloadAllRegistrations = async () => {
    try {
      setIsExporting(true);
      const response = await exportAllRegistrations();

      if (response?.data?.length > 0) {
        downloadCSV(response.data, "all_registrations_complete");
        alert(
          `Successfully exported ${response.totalRecords} registration records!`
        );
      } else {
        alert("No registration data available to export");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Render data tables for list categories
  const renderDetailsList = () => {
    const listData = data?.[activeCategory] || [];

    if (listData.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-4">
            No data available for this category
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {categoryTabs.find((c) => c.id === activeCategory)?.title} Details
          </h3>
          <button
            onClick={downloadCurrentCategoryData}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                {activeCategory === "pending_payment" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.batch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>
                  {activeCategory === "pending_payment" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        ₹{item.amountDue?.toLocaleString() || 0}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Function to render the registration overview with multiple charts
  const renderRegistrationOverview = () => {
    return (
      <div className="space-y-6">
        {/* Contribution Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Participation Summary
            </h3>
            <button
              onClick={downloadCurrentCategoryData}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 rounded-lg animate-pulse"
                >
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-700">Accommodation</h4>
                  <HomeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {data?.need_accommodation?.length || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  people need accommodation
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-700">Volunteers</h4>
                  <HandRaisedIcon className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {data?.volunteers?.length || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  people volunteering
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-yellow-700">Ride Share</h4>
                  <TruckIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-800">
                  {data?.ride_share?.length || 0}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  offering/seeking rides
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-700">Sponsors</h4>
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {data?.sponsors?.length || 0}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  potential sponsors
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Types Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registration Type Distribution
            </h3>
            <div className="h-[300px] flex justify-center items-center">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
              ) : registrationTypeData.datasets[0].data.every(
                  (val) => val === 0
                ) ? (
                <p className="text-gray-500">No registration data available</p>
              ) : (
                <Pie
                  data={registrationTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Payment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payment Status Distribution
            </h3>
            <div className="h-[300px] flex justify-center items-center">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
              ) : paymentStatusData.datasets[0].data.every(
                  (val) => val === 0
                ) ? (
                <p className="text-gray-500">No payment data available</p>
              ) : (
                <Pie
                  data={paymentChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Razorpay payments section
  const renderRazorpayPayments = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Razorpay Payment Summary
            </h3>
          </div>

          {isLoadingRazorpay ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : !razorpayData ? (
            <p className="text-gray-500">No Razorpay payment data available</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    Total Revenue (Razorpay)
                  </p>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    ₹{razorpayData.totalAmount?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">
                    Total Payments
                  </p>
                  <p className="text-2xl font-bold text-blue-800 mt-1">
                    {razorpayData.totalPayments || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-700">
                    Schools Contributing
                  </p>
                  <p className="text-2xl font-bold text-purple-800 mt-1">
                    {razorpayData.schoolStats?.length || 0}
                  </p>
                </div>
              </div>

              {razorpayData.schoolStats &&
                razorpayData.schoolStats.length > 0 && (
                  <div className="overflow-x-auto mt-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            School
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {razorpayData.schoolStats.map((school) => (
                          <tr key={school.school} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {school.school}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {school.count}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                ₹{school.totalAmount?.toLocaleString() || 0}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render appropriate content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case "razorpay_payments":
        return renderRazorpayPayments();

      case "registration_overview":
        return renderRegistrationOverview();

      case "district_wise":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Where Our Alumni Come From – District-wise
              </h3>
              <div className="h-[500px] flex justify-center items-center">
                {isLoadingDistrict ? (
                  <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
                ) : !districtChartData.labels.length ? (
                  <p className="text-gray-500">No district data available</p>
                ) : (
                  <Bar
                    data={districtChartData}
                    plugins={[ChartDataLabels]}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { precision: 0 },
                        },
                        x: {
                          ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 45,
                          },
                        },
                      },
                      plugins: {
                        legend: { position: "top" },
                        title: { display: false },
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
                    }}
                  />
                )}
              </div>
            </div>

            {/* Enhanced District Details Table */}
            {districtData && districtData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detailed District Statistics
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          District
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alumni
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attending
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {districtData.map((district) => {
                        const completionRate =
                          district.totalRegistrations > 0
                            ? (
                                (district.paidCount /
                                  district.totalRegistrations) *
                                100
                              ).toFixed(1)
                            : 0;

                        return (
                          <tr
                            key={district.district}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {district.district || "Outside Kerala"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-semibold">
                                {district.totalRegistrations}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-600">
                                {district.alumniCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">
                                {district.staffCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-purple-600">
                                {district.attendingCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-indigo-600">
                                {district.paidCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  completionRate >= 80
                                    ? "bg-green-100 text-green-800"
                                    : completionRate >= 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {completionRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case "school_participation":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                JNV School Distribution - Registrations, Attendees & Children
                below 6 years
              </h3>
              <button
                onClick={downloadCurrentCategoryData}
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>
            <div className="h-[500px] flex justify-center items-center">
              {!schoolData.labels.length ? (
                <p className="text-gray-500">No school data available</p>
              ) : (
                <Bar
                  data={schoolData}
                  plugins={[ChartDataLabels]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                      x: {
                        ticks: {
                          autoSkip: true,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
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
                  }}
                />
              )}
            </div>
          </div>
        );

      case "successful_participation":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                JNV School Distribution - Registrations, Attendees & Children
                below 6 years
              </h3>
              <button
                onClick={downloadCurrentCategoryData}
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>
            <div className="h-[500px] flex justify-center items-center">
              {!schoolData.labels.length ? (
                <p className="text-gray-500">No school data available</p>
              ) : (
                <Bar
                  data={schoolData}
                  plugins={[ChartDataLabels]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                      x: {
                        ticks: {
                          autoSkip: true,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
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
                  }}
                />
              )}
            </div>
          </div>
        );

      case "payment_status":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Status Distribution
                </h3>
                <button
                  onClick={downloadCurrentCategoryData}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>
              <div className="h-[400px] flex justify-center items-center">
                {isLoadingPayment ? (
                  <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
                ) : paymentStatusData.datasets[0].data.every(
                    (val) => val === 0
                  ) ? (
                  <p className="text-gray-500">No payment data available</p>
                ) : (
                  <Pie
                    data={paymentStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "bottom" },
                        title: { display: false },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Analytics
              </h3>
              {isLoadingPayment ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-4 rounded-lg animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentData?.map((payment) => (
                    <div
                      key={payment.status}
                      className={`p-4 rounded-lg border ${
                        payment.status === "Completed"
                          ? "border-green-200 bg-green-50"
                          : payment.status === "pending" ||
                            payment.status === "financial-difficulty" ||
                            payment.status === null
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          payment.status === "Completed"
                            ? "text-green-700"
                            : payment.status === "pending" ||
                              payment.status === "financial-difficulty" ||
                              payment.status === null
                            ? "text-yellow-700"
                            : "text-gray-700"
                        }`}
                      >
                        {payment.status === "Completed"
                          ? "Completed"
                          : payment.status === "financial-difficulty"
                          ? "Financial Difficulty"
                          : "Other"}{" "}
                        Payments
                      </p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          payment.status === "Completed"
                            ? "text-green-800"
                            : payment.status === "pending" ||
                              payment.status === "financial-difficulty" ||
                              payment.status === null
                            ? "text-yellow-800"
                            : "text-gray-800"
                        }`}
                      >
                        {payment.count}
                      </p>
                    </div>
                  )) || (
                    // Fallback to basic stats if enhanced data not available
                    <>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700">
                          Completed Payments
                        </p>
                        <p className="text-2xl font-bold text-green-800 mt-1">
                          {data?.paymentStatusCount?.completed || 0}
                        </p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-700">
                          Financial Difficulty
                        </p>
                        <p className="text-2xl font-bold text-yellow-800 mt-1">
                          {data?.paymentStatusCount?.pending || 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return renderDetailsList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analytics for UNMA 2026 registrations and
              contributions
            </p>
          </div>
          <button
            onClick={downloadAllRegistrations}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {isExporting ? "Exporting..." : "Export All Data"}
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>
          </section>

          {/* Analytics Categories */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detailed Analytics
            </h2>

            {/* Category Tabs */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((category) => (
                  <CategoryTab
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    icon={category.icon}
                    isActive={activeCategory === category.id}
                    onClick={setActiveCategory}
                  />
                ))}
              </div>
            </div>

            {/* Content Area */}
            {renderContent()}
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
