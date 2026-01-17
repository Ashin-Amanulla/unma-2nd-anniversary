import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  CalendarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  useAccommodationStats,
  useAccommodationProviders,
  useAccommodationSeekers,
  useHotelRequests,
  useCompatibleProviders,
  useAccommodationDistricts,
  useAccommodationSchools,
  useAccommodationFilters,
  useContactPerson,
  useExportAccommodationData,
} from "../../hooks/useAccommodation";

const AccommodationManagement = () => {
  const [activeTab, setActiveTab] = useState("providers");
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState(null);

  // Initialize filters using custom hook
  const { filters, updateFilter, updateFilters, resetFilters } =
    useAccommodationFilters({
      page: 1,
      limit: 20,
    });

  // Initialize contact functionality
  const { contactPerson } = useContactPerson();

  // Export functionality
  const exportMutation = useExportAccommodationData();

  // Fetch data using TanStack Query hooks
  const { data: statsData, isLoading: statsLoading } =
    useAccommodationStats(filters);
  const { data: providersData, isLoading: providersLoading } =
    useAccommodationProviders(activeTab === "providers" ? filters : {}, {
      enabled: activeTab === "providers",
    });
  const { data: seekersData, isLoading: seekersLoading } =
    useAccommodationSeekers(activeTab === "seekers" ? filters : {}, {
      enabled: activeTab === "seekers",
    });
  const { data: hotelsData, isLoading: hotelsLoading } = useHotelRequests(
    activeTab === "hotels" ? filters : {},
    { enabled: activeTab === "hotels" }
  );
  const { data: districtsData } = useAccommodationDistricts();
  const { data: schoolsData } = useAccommodationSchools();
  const { data: compatibleData, isLoading: compatibleLoading } =
    useCompatibleProviders(selectedSeeker?._id, {
      enabled: !!selectedSeeker && showMatchModal,
    });

  // Extract data from API responses
  const stats = statsData?.data || {
    providers: { count: 0 },
    seekers: { count: 0 },
    hotelRequests: { count: 0 },
  };
  const providers = providersData?.data?.providers || [];
  const seekers = seekersData?.data?.seekers || [];
  const hotels = hotelsData?.data?.hotelRequests || [];
  const districts = districtsData?.data || [];
  const schools = schoolsData?.data || [];
  const compatibleProviders = compatibleData?.data?.compatibleProviders || [];

  // Loading states
  const loading =
    statsLoading || providersLoading || seekersLoading || hotelsLoading;

  // Handle export functionality
  const handleExport = (type) => {
    exportMutation.mutate(type);
  };

  // Create connection between provider and seeker
  const createConnection = (provider, seeker) => {
    setSelectedConnection({ provider, seeker });
    setShowConnectionModal(true);
  };

  // Find compatible providers for a seeker
  const findCompatibleProviders = (seeker) => {
    setSelectedSeeker(seeker);
    setShowMatchModal(true);
  };

  // Render provider card
  const ProviderCard = ({ provider }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md border border-green-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <HomeIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {provider.name}
            </h3>
            <p className="text-sm text-gray-600">{provider.school}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Can accommodate {provider.capacity} people
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Batch {provider.yearOfPassing}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="w-4 h-4 mr-2" />
            <span className="capitalize">
              {provider.gender?.replace("-", " ") || "Any gender"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span>
              {provider.accommodationDistrict || "Location not specified"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <span>{provider.contactNumber}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{provider.email}</span>
          </div>
        </div>

        {provider.location && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Location:</strong> {provider.location}
            </p>
            {provider.landmark && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Landmark:</strong> {provider.landmark}
              </p>
            )}
          </div>
        )}

        {provider.remarks && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Remarks:</strong> {provider.remarks}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => contactPerson(provider.contactNumber, provider.name)}
            className="inline-flex items-center px-3 py-2 border border-green-600 text-sm leading-4 font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PhoneIcon className="w-4 h-4 mr-1" />
            Contact
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Render seeker card
  const SeekerCard = ({ seeker }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md border border-blue-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {seeker.name}
            </h3>
            <p className="text-sm text-gray-600">{seeker.school}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Needs accommodation for {seeker.totalNeeded} people
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Batch {seeker.yearOfPassing}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <span>{seeker.contactNumber}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{seeker.email}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Accommodation needed:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {seeker.needed.male > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {seeker.needed.male}
                </div>
                <div className="text-xs text-gray-600">Male</div>
              </div>
            )}
            {seeker.needed.female > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-pink-600">
                  {seeker.needed.female}
                </div>
                <div className="text-xs text-gray-600">Female</div>
              </div>
            )}
            {seeker.needed.other > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {seeker.needed.other}
                </div>
                <div className="text-xs text-gray-600">Other</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => contactPerson(seeker.contactNumber, seeker.name)}
            className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm leading-4 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PhoneIcon className="w-4 h-4 mr-1" />
            Contact
          </button>
          <button
            onClick={() => findCompatibleProviders(seeker)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Find Match
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Render hotel request card
  const HotelCard = ({ hotel }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md border border-purple-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {hotel.name}
            </h3>
            <p className="text-sm text-gray-600">{hotel.school}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          Batch {hotel.yearOfPassing}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <span>{hotel.contactNumber}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{hotel.email}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {hotel.adults}
              </div>
              <div className="text-xs text-gray-600">Adults</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {hotel.children}
              </div>
              <div className="text-xs text-gray-600">Children</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 capitalize">
                {hotel.roomPreference || "Any"}
              </div>
              <div className="text-xs text-gray-600">Room Type</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                {hotel.checkInDate && hotel.checkOutDate
                  ? `${new Date(
                      hotel.checkInDate
                    ).toLocaleDateString()} - ${new Date(
                      hotel.checkOutDate
                    ).toLocaleDateString()}`
                  : "Dates TBD"}
              </div>
              <div className="text-xs text-gray-600">Stay Duration</div>
            </div>
          </div>
        </div>

        {hotel.specialRequests && (
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Special Requests:</strong> {hotel.specialRequests}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => contactPerson(hotel.contactNumber, hotel.name)}
            className="inline-flex items-center px-3 py-2 border border-purple-600 text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PhoneIcon className="w-4 h-4 mr-1" />
            Contact
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Match Modal Component
  const MatchModal = () => (
    <AnimatePresence>
      {showMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Compatible Providers for {selectedSeeker?.name}
                </h2>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {selectedSeeker && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Accommodation Request Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">
                        Total Needed:
                      </span>
                      <div className="text-blue-900">
                        {selectedSeeker.totalNeeded} people
                      </div>
                    </div>
                    {selectedSeeker.needed.male > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">Male:</span>
                        <div className="text-blue-900">
                          {selectedSeeker.needed.male}
                        </div>
                      </div>
                    )}
                    {selectedSeeker.needed.female > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">
                          Female:
                        </span>
                        <div className="text-blue-900">
                          {selectedSeeker.needed.female}
                        </div>
                      </div>
                    )}
                    {selectedSeeker.needed.other > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">
                          Other:
                        </span>
                        <div className="text-blue-900">
                          {selectedSeeker.needed.other}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {compatibleProviders.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Found {compatibleProviders.length} Compatible Provider
                    {compatibleProviders.length !== 1 ? "s" : ""}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {compatibleProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {provider.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {provider.school}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Can accommodate {provider.capacity}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Gender preference:
                            </span>
                            <span className="capitalize">
                              {provider.gender?.replace("-", " ") || "Any"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span>
                              {provider.accommodationDistrict ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contact:</span>
                            <span>{provider.contactNumber}</span>
                          </div>
                        </div>

                        {provider.location && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <strong>Address:</strong> {provider.location}
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={() =>
                              contactPerson(
                                provider.contactNumber,
                                provider.name
                              )
                            }
                            className="inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                          >
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            Contact Provider
                          </button>
                          <button
                            onClick={() => {
                              // Create a group message
                              const seekerNumber =
                                selectedSeeker.contactNumber.replace(
                                  /[^\d]/g,
                                  ""
                                );
                              const providerNumber =
                                provider.contactNumber.replace(/[^\d]/g, "");
                              const message = `Hello! I'm connecting you both for accommodation arrangements for UNMA 2026.\n\n${selectedSeeker.name} needs accommodation for ${selectedSeeker.totalNeeded} people.\n${provider.name} can provide accommodation for up to ${provider.capacity} people.\n\nSeeker Contact: +${seekerNumber}\nProvider Contact: +${providerNumber}\n\nPlease coordinate directly. Thank you!`;

                              // You could implement a more sophisticated connection system here
                              toast.success(
                                "Connection details copied! You can now coordinate between both parties."
                              );
                              navigator.clipboard
                                .writeText(message)
                                .catch(() => {
                                  // Fallback if clipboard API fails
                                  console.log("Connection message:", message);
                                });
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Connect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No compatible providers found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No providers match the capacity and gender requirements for
                    this request.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accommodation Management
        </h1>
        <p className="text-gray-600">
          Connect accommodation providers with those seeking accommodation for
          UNMA 2026
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <HomeIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-green-600">
                  {stats.providers.count}
                </p>
                <p className="text-sm text-gray-600">Accommodation Providers</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-blue-600">
                  {stats.seekers.count}
                </p>
                <p className="text-sm text-gray-600">Seeking Accommodation</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-purple-600">
                  {stats.hotelRequests.count}
                </p>
                <p className="text-sm text-gray-600">Hotel Requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, school, or location..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={filters.gender}
            onChange={(e) => updateFilter("gender", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Genders</option>
            <option value="male-only">Male Only</option>
            <option value="female-only">Female Only</option>
            <option value="anyone">Anyone</option>
          </select>

          {/* District Filter */}
          <select
            value={filters.district}
            onChange={(e) => updateFilter("district", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Districts</option>
            {districts.map((districtData) => (
              <option key={districtData.district} value={districtData.district}>
                {districtData.district} ({districtData.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              {
                id: "providers",
                label: "Providers",
                count: providers.length,
                color: "green",
              },
              {
                id: "seekers",
                label: "Seeking",
                count: seekers.length,
                color: "blue",
              },
              {
                id: "hotels",
                label: "Hotel Requests",
                count: hotels.length,
                color: "purple",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-600`
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "providers" && (
              <motion.div
                key="providers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {providers.map((provider) => (
                  <ProviderCard key={provider._id} provider={provider} />
                ))}
                {providers.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No providers found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "seekers" && (
              <motion.div
                key="seekers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {seekers.map((seeker) => (
                  <SeekerCard key={seeker._id} seeker={seeker} />
                ))}
                {seekers.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No seekers found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "hotels" && (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {hotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
                {hotels.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hotel requests found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match Modal */}
      <MatchModal />
    </div>
  );
};

export default AccommodationManagement;
