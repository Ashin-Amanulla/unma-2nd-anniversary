import { useState } from "react";
import {
  EyeIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Import TanStack Query hooks
import {
  useUserLogs,
  useUserLogsStats,
  useUserLog,
  useExportUserLogs,
} from "../../hooks";

const UserLogs = () => {
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: "",
    method: "",
    category: "",
    statusCode: "",
    startDate: "",
    endDate: "",
    userEmail: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
  });

  // Use TanStack Query hooks
  const {
    data: logsData,
    isLoading: loading,
    error,
  } = useUserLogs({
    ...filters,
    ...pagination,
  });

  const { data: stats } = useUserLogsStats();

  const { data: selectedLog, isLoading: loadingLogDetails } =
    useUserLog(selectedLogId);

  const exportLogsMutation = useExportUserLogs();

  // Extract data from response
  const logs = logsData?.logs || [];
  const paginationData = logsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasPrevPage: false,
    hasNextPage: false,
  };

  // Export logs
  const exportLogs = async (format = "csv") => {
    exportLogsMutation.mutate({ filters, format });
  };

  // View log details
  const viewLogDetails = (logId) => {
    setSelectedLogId(logId);
    setShowDetails(true);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      method: "",
      category: "",
      statusCode: "",
      startDate: "",
      endDate: "",
      userEmail: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          {statusCode}
        </span>
      );
    } else if (statusCode >= 400) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          {statusCode}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {statusCode}
      </span>
    );
  };

  // Get method badge
  const getMethodBadge = (method) => {
    const colors = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-yellow-100 text-yellow-800",
      PATCH: "bg-orange-100 text-orange-800",
      DELETE: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colors[method] || "bg-gray-100 text-gray-800"
        }`}
      >
        {method}
      </span>
    );
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    const colors = {
      authentication: "bg-purple-100 text-purple-800",
      user_management: "bg-indigo-100 text-indigo-800",
      data_access: "bg-cyan-100 text-cyan-800",
      configuration: "bg-orange-100 text-orange-800",
      analytics: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colors[category] || "bg-gray-100 text-gray-800"
        }`}
      >
        {category?.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            User Activity Logs
          </h1>
          <p className="text-gray-600">
            Monitor and track all admin user activities for transparency and
            accountability
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportLogs("csv")}
            disabled={exportLogsMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {exportLogsMutation.isPending ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.summary?.totalLogs?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.summary?.uniqueUsers || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Error Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.summary?.errorLogs || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Avg Response
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.summary?.averageResponseTime || 0)}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search users, actions..."
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select
              value={filters.method}
              onChange={(e) => handleFilterChange("method", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="user_management">User Management</option>
              <option value="data_access">Data Access</option>
              <option value="configuration">Configuration</option>
              <option value="analytics">Analytics</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Code
            </label>
            <select
              value={filters.statusCode}
              onChange={(e) => handleFilterChange("statusCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="200">200 - Success</option>
              <option value="201">201 - Created</option>
              <option value="400">400 - Bad Request</option>
              <option value="401">401 - Unauthorized</option>
              <option value="403">403 - Forbidden</option>
              <option value="404">404 - Not Found</option>
              <option value="500">500 - Server Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="text"
              value={filters.userEmail}
              onChange={(e) => handleFilterChange("userEmail", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDate(log.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {log.userName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.userEmail}
                        </div>
                        <div className="text-xs text-gray-400">
                          {log.userRole}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={log.action}>
                      {log.action}
                    </div>
                    <div
                      className="text-xs text-gray-500 truncate"
                      title={log.endpoint}
                    >
                      {log.endpoint}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getMethodBadge(log.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(log.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.statusCode)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ComputerDesktopIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {log.ipAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {log.responseTime}ms
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewLogDetails(log._id)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(paginationData.currentPage - 1)}
                disabled={!paginationData.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(paginationData.currentPage + 1)}
                disabled={!paginationData.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(paginationData.currentPage - 1) * paginationData.limit +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      paginationData.currentPage * paginationData.limit,
                      paginationData.totalCount
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {paginationData.totalCount}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      handlePageChange(paginationData.currentPage - 1)
                    }
                    disabled={!paginationData.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {[...Array(Math.min(paginationData.totalPages, 10))].map(
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === paginationData.currentPage
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() =>
                      handlePageChange(paginationData.currentPage + 1)
                    }
                    disabled={!paginationData.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Log Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedLogId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

              {loadingLogDetails ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedLog ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.userName} ({selectedLog.userEmail})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.userRole}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timestamp
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedLog.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        IP Address
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.ipAddress}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Method
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.method}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status Code
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.statusCode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Response Time
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.responseTime}ms
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.category}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full URL
                    </label>
                    <p className="text-sm text-gray-900 break-all">
                      {selectedLog.fullUrl}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Action
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.action}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Agent
                    </label>
                    <p className="text-sm text-gray-900 break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>

                  {selectedLog.requestBody &&
                    Object.keys(selectedLog.requestBody).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Request Body
                        </label>
                        <pre className="text-xs text-gray-900 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                  {selectedLog.queryParams &&
                    Object.keys(selectedLog.queryParams).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Query Parameters
                        </label>
                        <pre className="text-xs text-gray-900 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.queryParams, null, 2)}
                        </pre>
                      </div>
                    )}

                  {selectedLog.errorMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Error Message
                      </label>
                      <p className="text-sm text-red-600">
                        {selectedLog.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Failed to load log details
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            {error?.message || "An error occurred"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserLogs;
