import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import republicDayEventApi from "../../api/republicDayEventApi";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const RepublicDayEventRegistrations = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // State
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jnvSchoolFilter, setJnvSchoolFilter] = useState("");
  const [foodChoiceFilter, setFoodChoiceFilter] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(jnvSchoolFilter && { jnvSchool: jnvSchoolFilter }),
        ...(foodChoiceFilter && { foodChoice: foodChoiceFilter }),
        ...(sponsorFilter && { interestedInSponsorship: sponsorFilter === "yes" }),
      };
      
      const response = await republicDayEventApi.getAllRegistrations(params);
      setRegistrations(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        pages: response.pagination?.pages || 1,
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
      setError(err.message || "Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, pagination.page, search, jnvSchoolFilter, foodChoiceFilter, sponsorFilter]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setJnvSchoolFilter("");
    setFoodChoiceFilter("");
    setSponsorFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all registrations with current filters applied
      const params = {
        page: 1,
        limit: 10000, // Large limit to fetch all records
        ...(search && { search }),
        ...(jnvSchoolFilter && { jnvSchool: jnvSchoolFilter }),
        ...(foodChoiceFilter && { foodChoice: foodChoiceFilter }),
        ...(sponsorFilter && { interestedInSponsorship: sponsorFilter === "yes" }),
      };
      
      const response = await republicDayEventApi.getAllRegistrations(params);
      const allRegistrations = response.data || [];
      
      if (allRegistrations.length === 0) {
        alert("No registrations found to export");
        return;
      }

      const headers = [
        "Name",
        "Email",
        "Phone",
        "JNV School",
        "JNV Other",
        "Batch Year",
        "Food Choice",
        "Family Members Count",
        "Blood Donation",
        "National Song",
        "Boat Ride",
        "Volunteer",
        "WhatsApp Group",
        "Interested in Sponsorship",
        "Payment Method",
        "Amount Paid",
        "Transaction ID",
        "Payment Date",
        "Submitted",
        "Registration Date",
        "Last Updated",
      ];

      const rows = allRegistrations.map((reg) => [
        reg.name,
        reg.email,
        reg.phoneNumber,
        reg.jnvSchool,
        reg.jnvOther || "",
        reg.batchYear || "",
        reg.foodChoice,
        reg.familyMembersCount ?? "",
        reg.participateBloodDonation ? "Yes" : "No",
        reg.participateNationalSong ? "Yes" : "No",
        reg.joinBoatRide ? "Yes" : "No",
        reg.readyToVolunteer ? "Yes" : "No",
        reg.partOfWhatsAppGroup ? "Yes" : "No",
        reg.interestedInSponsorship ? "Yes" : "No",
        reg.paymentMethod || "",
        reg.amountPaid || 0,
        reg.transactionId || "",
        reg.paymentDate ? new Date(reg.paymentDate).toLocaleDateString() : "",
        reg.submitted ? "Yes" : "No",
        new Date(reg.registrationDate).toLocaleDateString(),
        new Date(reg.lastUpdated).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `republic_day_registrations_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Boolean indicator component
  const BooleanIndicator = ({ value }) => {
    return value ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-gray-300" />
    );
  };

  // View registration details
  const viewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Republic Day Event Registrations
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} registrations found
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/republic-day-event/dashboard"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Dashboard
          </Link>
          <button
            onClick={exportToCSV}
            disabled={isExporting || pagination.total === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-300 text-gray-700"
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
          
          {/* Clear Filters */}
          {(search || jnvSchoolFilter || foodChoiceFilter || sponsorFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:text-red-700 flex items-center gap-2"
            >
              <XMarkIcon className="h-5 w-5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JNV School
              </label>
              <input
                type="text"
                placeholder="Filter by school..."
                value={jnvSchoolFilter}
                onChange={(e) => {
                  setJnvSchoolFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Choice
              </label>
              <select
                value={foodChoiceFilter}
                onChange={(e) => {
                  setFoodChoiceFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor Ticket
              </label>
              <select
                value={sponsorFilter}
                onChange={(e) => {
                  setSponsorFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="yes">Interested in Sponsorship</option>
                <option value="no">Not Interested</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School / Batch
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Food
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Song
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boat
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-gray-200 rounded w-12 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-gray-200 rounded w-5 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-gray-200 rounded w-5 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-gray-200 rounded w-5 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-gray-200 rounded w-5 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{reg.name}</div>
                      <div className="text-sm text-gray-500">{reg.email}</div>
                      <div className="text-sm text-gray-500">{reg.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{reg.jnvSchool}</div>
                      {reg.batchYear && (
                        <div className="text-sm text-gray-500">Batch: {reg.batchYear}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                          {1 + (reg.familyMembersCount || 0)}
                        </span>
                        {reg.familyMembersCount > 0 && (
                          <span className="text-xs text-gray-500 mt-1">
                            +{reg.familyMembersCount} guest{reg.familyMembersCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reg.foodChoice === "Veg"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reg.foodChoice}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <BooleanIndicator value={reg.participateBloodDonation} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <BooleanIndicator value={reg.participateNationalSong} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <BooleanIndicator value={reg.joinBoatRide} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <BooleanIndicator value={reg.readyToVolunteer} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {reg.amountPaid > 0 ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{reg.amountPaid}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reg.paymentMethod || "N/A"}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => viewDetails(reg)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left bg-white rounded-lg shadow-xl transform transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registration Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    Personal Information
                  </h4>
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedRegistration.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedRegistration.phoneNumber}</p>
                  </div>
                </div>

                {/* School Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    School Information
                  </h4>
                  <div>
                    <span className="text-sm text-gray-500">JNV School:</span>
                    <p className="font-medium">{selectedRegistration.jnvSchool}</p>
                  </div>
                  {selectedRegistration.jnvOther && (
                    <div>
                      <span className="text-sm text-gray-500">Other:</span>
                      <p className="font-medium">{selectedRegistration.jnvOther}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Batch Year:</span>
                    <p className="font-medium">{selectedRegistration.batchYear || "N/A"}</p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    Preferences
                  </h4>
                  <div>
                    <span className="text-sm text-gray-500">Food Choice:</span>
                    <p className="font-medium">{selectedRegistration.foodChoice}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Family Members:</span>
                    <p className="font-medium">{selectedRegistration.familyMembersCount ?? "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">WhatsApp Group:</span>
                    <BooleanIndicator value={selectedRegistration.partOfWhatsAppGroup} />
                  </div>
                </div>

                {/* Participation */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    Participation
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Blood Donation:</span>
                    <BooleanIndicator value={selectedRegistration.participateBloodDonation} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">National Song:</span>
                    <BooleanIndicator value={selectedRegistration.participateNationalSong} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Boat Ride:</span>
                    <BooleanIndicator value={selectedRegistration.joinBoatRide} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Volunteer:</span>
                    <BooleanIndicator value={selectedRegistration.readyToVolunteer} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sponsorship Interest:</span>
                    <BooleanIndicator value={selectedRegistration.interestedInSponsorship} />
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Amount Paid:</span>
                      <p className="font-medium">₹{selectedRegistration.amountPaid || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Payment Method:</span>
                      <p className="font-medium">{selectedRegistration.paymentMethod || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Transaction ID:</span>
                      <p className="font-medium">{selectedRegistration.transactionId || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Payment Date:</span>
                      <p className="font-medium">
                        {selectedRegistration.paymentDate
                          ? new Date(selectedRegistration.paymentDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-medium text-gray-700 border-b pb-1">
                    Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Registered On:</span>
                      <p className="font-medium">
                        {new Date(selectedRegistration.registrationDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <p className="font-medium">
                        {new Date(selectedRegistration.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepublicDayEventRegistrations;
