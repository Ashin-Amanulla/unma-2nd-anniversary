import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import { jnvSchools } from "../../assets/data";
import registrationsApi from "../../api/registrationsApi";
import adminApi from "../../api/adminApi";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const Registrations = () => {
  const { isSuperAdmin } = useAuthStore();
  console.log("isSuperAdmin", isSuperAdmin);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    registrationType: "",
    paymentStatus: "",
    formSubmissionComplete: "",
    isAttending: "",
    school: "",
    sponsorTicket: "",
    fromDate: "",
    toDate: "",
    page: 1,
    limit: 10,
    sortBy: "registrationDate",
    sortOrder: "desc",
  });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);

  const { useRegistrations, useRegistrationStats, exportAllRegistrations } =
    useAdmin();
  const { data, isLoading, error } = useRegistrations(filters);
  const { data: registrationStats, isLoading: isLoadingStats } =
    useRegistrationStats();
  const { isAuthenticated } = useAuthStore();

  const handleSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleView = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRegistration(null);
  };

  const handleEdit = (registration) => {
    setEditingRegistration(registration);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRegistration(null);
  };

  const handleRegistrationUpdate = () => {
    // This will trigger a refetch of the registrations data
    // The useRegistrations hook will automatically refetch when filters change
    setFilters((prev) => ({ ...prev }));
  };

  const getAttendeeCount = (registration) => {
    const attendees =
      registration?.formDataStructured?.eventAttendance?.attendees;
    if (!attendees) return 0;

    return (
      (attendees.adults?.veg || 0) +
      (attendees.adults?.nonVeg || 0) +
      (attendees.teens?.veg || 0) +
      (attendees.teens?.nonVeg || 0) +
      (attendees.children?.veg || 0) +
      (attendees.children?.nonVeg || 0) +
      (attendees.toddlers?.veg || 0) +
      (attendees.toddlers?.nonVeg || 0)
    );
  };

  // Helper function to mask email
  const maskEmail = (email) => {
    if (!email) return "N/A";
    const [username, domain] = email.split("@");
    if (!domain) return email;
    const maskedUsername =
      username.length > 2
        ? username.substring(0, 2) + "*".repeat(username.length - 2)
        : username;
    return `${maskedUsername}@${domain}`;
  };

  // Helper function to mask phone number
  const maskPhone = (phone) => {
    if (!phone) return "N/A";
    if (phone.length <= 4) return phone;
    return (
      phone.substring(0, 2) +
      "*".repeat(phone.length - 4) +
      phone.substring(phone.length - 2)
    );
  };
  const [isExporting, setIsExporting] = useState(false);

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

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all event registrations
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
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="space-y-4">
          {/* First Row - Main Filters */}
          {/* conditional design change */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.search}
                onChange={handleSearch}
              />
            </div>

            <div>
              <select
                name="registrationType"
                value={filters.registrationType}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Alumni">Alumni</option>
                <option value="Staff">Staff</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="complete">Complete</option>
                <option value="review">Review</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>

            <div>
              <select
                name="sponsorTicket"
                value={filters.sponsorTicket}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Sponsors</option>
                <option value="interested">Interested in Sponsorship</option>
                <option value="canRefer">Can Refer Sponsorship</option>
                <option value="hasTier">Has Sponsorship Tier</option>
              </select>
            </div>

            {isSuperAdmin && (
              <div>
                <select
                  name="school"
                  value={filters.school}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Schools</option>
                  {jnvSchools.map((school) => (
                    <option key={school.value} value={school.value}>
                      {school.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Second Row - Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: "",
                    toDate: "",
                    page: 1,
                  }))
                }
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Dates
              </button>
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-500">
                {filters.fromDate || filters.toDate
                  ? `Filtering: ${filters.fromDate || "Start"} to ${
                      filters.toDate || "End"
                    }`
                  : "No date filter applied"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School & Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="px-6 py-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-red-500"
                  >
                    Error loading registrations: {error.message}
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    No registrations found
                  </td>
                </tr>
              ) : (
                data?.data?.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {registration.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maskEmail(registration.email)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maskPhone(registration.contactNumber)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {registration.registrationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.formDataStructured?.personalInfo
                          ?.school || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.formDataStructured?.personalInfo
                          ?.yearOfPassing || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {!registration.formSubmissionComplete ? (
                          <span className="text-sm font-medium text-red-600">
                            Incomplete
                          </span>
                        ) : registration.paymentStatus === "Completed" ? (
                          <span className="text-sm font-medium text-gray-900">
                            ₹
                            {
                              registration.formDataStructured.financial
                                .contributionAmount
                            }
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-blue-600">
                            Review
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {registration.formSubmissionComplete ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Complete
                            </span>
                          </>
                        ) : (
                          <>
                            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-yellow-700 font-medium">
                              Step {registration.currentStep || 1}/8
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {registration.formDataStructured?.eventAttendance
                          ?.isAttending ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {getAttendeeCount(registration)} people
                            </span>
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                            <span className="text-sm text-gray-500">
                              Not attending
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {registration.registrationDate
                          ? format(
                              new Date(registration.registrationDate),
                              "MMM d, yyyy"
                            )
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(registration)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                          {
                        isSuperAdmin && (
                      
                      <button
                        onClick={() => handleEdit(registration)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit details"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === data.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      filters.page * filters.limit,
                      data?.totalRegistrations || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {data?.totalRegistrations || 0}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {Array.from({
                    length: Math.min(data?.totalPages || 0, 10),
                  }).map((_, i) => {
                    const pageNum =
                      filters.page <= 5 ? i + 1 : filters.page - 4 + i;
                    if (pageNum > data.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedRegistration && (
        <DetailModal registration={selectedRegistration} onClose={closeModal} />
      )}

      {/* Edit Modal */}
      {showEditModal && editingRegistration && (
        <EditModal
          registration={editingRegistration}
          onClose={closeEditModal}
          onUpdate={handleRegistrationUpdate}
        />
      )}
    </div>
  );
};

// Separate component for the detail modal to keep main component clean
const DetailModal = ({ registration, onClose }) => {
  const personalInfo = registration.formDataStructured?.personalInfo || {};
  const eventAttendance =
    registration.formDataStructured?.eventAttendance || {};
  const financial = registration.formDataStructured?.financial || {};
  const transportation = registration.formDataStructured?.transportation || {};
  const accommodation = registration.formDataStructured?.accommodation || {};
  const professional = registration.formDataStructured?.professional || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="flex justify-between items-center bg-blue-600 px-6 py-4">
            <h3 className="text-xl leading-6 font-medium text-white">
              Registration Details
            </h3>
            <button
              onClick={onClose}
              className="bg-blue-600 rounded-md text-white hover:text-gray-200 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-6 py-5 max-h-[80vh] overflow-y-auto">
            {/* Header with basic info */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-2xl text-blue-600 font-bold">
                    {registration.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {registration.name}
                  </h2>
                  <p className="text-sm text-gray-500">{registration.email}</p>
                  <p className="text-sm text-gray-500">
                    {registration.contactNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {registration.registrationType}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    registration.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : registration.paymentStatus === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Payment: {registration.paymentStatus || "Pending"}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    registration.formSubmissionComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Form:{" "}
                  {registration.formSubmissionComplete
                    ? "Complete"
                    : "Incomplete"}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                  Step: {registration.currentStep || 1}/8
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800">
                    Personal Information
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <InfoRow label="School" value={personalInfo.school} />
                  <InfoRow
                    label="Year of Passing"
                    value={personalInfo.yearOfPassing}
                  />
                  <InfoRow
                    label="WhatsApp"
                    value={personalInfo.whatsappNumber}
                  />
                  <InfoRow
                    label="Blood Group"
                    value={personalInfo.bloodGroup}
                  />
                  <InfoRow label="State/UT" value={personalInfo.stateUT} />
                  <InfoRow label="District" value={personalInfo.district} />
                  <InfoRow label="Country" value={personalInfo.country} />
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800">
                    Professional Information
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <InfoRow
                    label="Profession"
                    value={
                      Array.isArray(professional.profession)
                        ? professional.profession.join(", ")
                        : professional.profession
                    }
                  />
                  <InfoRow
                    label="Professional Details"
                    value={professional.professionalDetails}
                  />
                  <InfoRow
                    label="Area of Expertise"
                    value={professional.areaOfExpertise}
                  />
                  <InfoRow label="Key Skills" value={professional.keySkills} />
                </div>
              </div>

              {/* Event Attendance */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800">
                    Event Attendance
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <InfoRow
                    label="Attending"
                    value={eventAttendance.isAttending ? "Yes" : "No"}
                    valueClassName={
                      eventAttendance.isAttending
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  />
                  {eventAttendance.attendees && (
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        Attendees Breakdown:
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          Adults:{" "}
                          {(eventAttendance.attendees.adults?.veg || 0) +
                            (eventAttendance.attendees.adults?.nonVeg || 0)}
                        </div>
                        <div>
                          Teens:{" "}
                          {(eventAttendance.attendees.teens?.veg || 0) +
                            (eventAttendance.attendees.teens?.nonVeg || 0)}
                        </div>
                        <div>
                          Children:{" "}
                          {(eventAttendance.attendees.children?.veg || 0) +
                            (eventAttendance.attendees.children?.nonVeg || 0)}
                        </div>
                        <div>
                          Toddlers:{" "}
                          {(eventAttendance.attendees.toddlers?.veg || 0) +
                            (eventAttendance.attendees.toddlers?.nonVeg || 0)}
                        </div>
                      </div>
                    </div>
                  )}
                  <InfoRow
                    label="Event Participation"
                    value={
                      Array.isArray(eventAttendance.eventParticipation)
                        ? eventAttendance.eventParticipation.join(", ")
                        : eventAttendance.eventParticipation
                    }
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800">
                    Financial Information
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <InfoRow
                    label="Will Contribute"
                    value={financial.willContribute ? "Yes" : "No"}
                    valueClassName={
                      financial.willContribute
                        ? "text-green-600 font-medium"
                        : "text-gray-600"
                    }
                  />
                  <InfoRow
                    label="Contribution Amount"
                    value={
                      financial.contributionAmount
                        ? `₹${financial.contributionAmount}`
                        : "N/A"
                    }
                  />
                  <InfoRow label="Payment ID" value={financial.paymentId} />
                  <InfoRow
                    label="Payment Remarks"
                    value={financial.paymentRemarks}
                  />
                </div>
              </div>

              {/* Transportation */}
              {transportation.isTravelling && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-base font-semibold text-gray-800">
                      Transportation
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <InfoRow
                      label="Starting Location"
                      value={transportation.startingLocation}
                    />
                    <InfoRow
                      label="Travel Date"
                      value={transportation.travelDate}
                    />
                    <InfoRow
                      label="Mode of Transport"
                      value={transportation.modeOfTransport}
                    />
                    <InfoRow
                      label="Connect with Navodayans"
                      value={transportation.connectWithNavodayans}
                    />
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {accommodation.planAccommodation && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-base font-semibold text-gray-800">
                      Accommodation
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <InfoRow
                      label="Accommodation Type"
                      value={accommodation.accommodation}
                    />
                    <InfoRow
                      label="Location"
                      value={accommodation.accommodationLocation}
                    />
                    <InfoRow
                      label="Capacity"
                      value={accommodation.accommodationCapacity}
                    />
                    <InfoRow
                      label="Remarks"
                      value={accommodation.accommodationRemarks}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-gray-800 mb-3">
                Registration Metadata
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">
                    Registration Date:
                  </span>
                  <div className="text-gray-900">
                    {registration.registrationDate
                      ? format(new Date(registration.registrationDate), "PPp")
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Last Updated:
                  </span>
                  <div className="text-gray-900">
                    {registration.lastUpdated
                      ? format(new Date(registration.lastUpdated), "PPp")
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Email Verified:
                  </span>
                  <div
                    className={`font-medium ${
                      registration.emailVerified
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {registration.emailVerified ? "Yes" : "No"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Current Step:
                  </span>
                  <div className="text-gray-900">
                    {registration.currentStep || 1} of 8
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value, valueClassName = "text-gray-900" }) => (
  <div className="flex py-3 px-4">
    <div className="w-1/3 text-sm font-medium text-gray-500">{label}</div>
    <div className={`w-2/3 text-sm ${valueClassName}`}>
      {value || "Not provided"}
    </div>
  </div>
);

const EditModal = ({ registration, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for financial data
  const [financialData, setFinancialData] = useState({
    willContribute:
      registration?.formDataStructured?.financial?.willContribute || false,
    contributionAmount:
      registration?.formDataStructured?.financial?.contributionAmount || 0,
    proposedAmount:
      registration?.formDataStructured?.financial?.proposedAmount || 0,
    paymentStatus:
      registration?.formDataStructured?.financial?.paymentStatus || "pending",
    paymentId: registration?.formDataStructured?.financial?.paymentId || "N/A",
    paymentRemarks:
      registration?.formDataStructured?.financial?.paymentRemarks || "N/A",
  });

  // Additional payment entry state
  const [additionalPayment, setAdditionalPayment] = useState({
    amount: "",
    transactionId: "",
    paymentMethod: "",
    remarks: "",
  });

  const handleFinancialChange = (field, value) => {
    setFinancialData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdditionalPaymentChange = (field, value) => {
    setAdditionalPayment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatePayload = {
        formDataStructured: {
          ...registration.formDataStructured,
          financial: {
            ...registration.formDataStructured?.financial,
            ...financialData,
          },
        },
      };


      await adminApi.updateRegistrationAdmin(registration._id, updatePayload);

      setSuccess("Registration updated successfully!");

      // Call the parent's onUpdate function to refresh the list
      if (onUpdate) {
        onUpdate();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating registration:", error);
      setError(error.message || "Failed to update registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!additionalPayment.amount || !additionalPayment.transactionId) {
      setError("Please fill in amount and transaction ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await registrationsApi.addMoreAmount(registration._id, {
        amount: parseFloat(additionalPayment.amount),
        transactionId: additionalPayment.transactionId,
        paymentMethod: additionalPayment.paymentMethod || "Manual Entry",
      });

      setSuccess("Additional payment added successfully!");
      setAdditionalPayment({
        amount: "",
        transactionId: "",
        paymentMethod: "",
        remarks: "",
      });

      // Call the parent's onUpdate function to refresh the list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      setError(error.message || "Failed to add payment");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", text: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      failed: { color: "bg-red-100 text-red-800", text: "Failed" },
      partial: { color: "bg-blue-100 text-blue-800", text: "Partial" },
      refunded: { color: "bg-gray-100 text-gray-800", text: "Refunded" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status || "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Registration
            </h2>
            <button
              onClick={onClose}
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
                />
              </svg>
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Financial Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Information
              </h3>

              <div className="space-y-4">
                {/* Will Contribute */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Will Contribute
                  </label>
                  <select
                    value={financialData.willContribute}
                    onChange={(e) =>
                      handleFinancialChange(
                        "willContribute",
                        e.target.value === "true"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>

                {/* Contribution Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribution Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={financialData.contributionAmount}
                    onChange={(e) =>
                      handleFinancialChange(
                        "contributionAmount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Proposed Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={financialData.proposedAmount}
                    onChange={(e) =>
                      handleFinancialChange(
                        "proposedAmount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter proposed amount"
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={financialData.paymentStatus}
                    onChange={(e) =>
                      handleFinancialChange("paymentStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Payment ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment ID
                  </label>
                  <input
                    type="text"
                    value={financialData.paymentId}
                    onChange={(e) =>
                      handleFinancialChange("paymentId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter payment ID"
                  />
                </div>

                {/* Payment Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Remarks
                  </label>
                  <textarea
                    value={financialData.paymentRemarks}
                    onChange={(e) =>
                      handleFinancialChange("paymentRemarks", e.target.value)
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter payment remarks"
                  />
                </div>
              </div>

              {/* Update Button */}
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Registration"}
                </button>
              </div>
            </div>

            {/* Right Column - Current Data & Additional Payment */}
            <div>
              {/* Current Financial Data */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Financial Data
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Will Contribute:
                    </span>
                    <span className="text-sm text-gray-900">
                      {registration?.formDataStructured?.financial
                        ?.willContribute
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Contribution Amount:
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatAmount(
                        registration?.formDataStructured?.financial
                          ?.contributionAmount || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Payment Status:
                    </span>
                    <span className="text-sm">
                      {getPaymentStatusBadge(
                        registration?.formDataStructured?.financial
                          ?.paymentStatus
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Payment ID:
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {registration?.formDataStructured?.financial?.paymentId ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {registration?.formDataStructured?.financial?.paymentHistory
                ?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment History
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {registration.formDataStructured.financial.paymentHistory.map(
                        (payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatAmount(payment.amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.paymentMethod} -{" "}
                                {payment.transactionId}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.date
                                ? new Date(payment.date).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Additional Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Additional Payment
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={additionalPayment.amount}
                      onChange={(e) =>
                        handleAdditionalPaymentChange("amount", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={additionalPayment.transactionId}
                      onChange={(e) =>
                        handleAdditionalPaymentChange(
                          "transactionId",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <input
                      type="text"
                      value={additionalPayment.paymentMethod}
                      onChange={(e) =>
                        handleAdditionalPaymentChange(
                          "paymentMethod",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., UPI, Net Banking, Card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={additionalPayment.remarks}
                      onChange={(e) =>
                        handleAdditionalPaymentChange("remarks", e.target.value)
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional remarks"
                    />
                  </div>

                  <button
                    onClick={handleAddPayment}
                    disabled={
                      isLoading ||
                      !additionalPayment.amount ||
                      !additionalPayment.transactionId
                    }
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Adding..." : "Add Payment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registrations;
