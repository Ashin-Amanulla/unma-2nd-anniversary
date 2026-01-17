import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  useTransportationStats,
  useVehicleProviders,
  useRideSeekers,
  useProximityGroups,
  useTransportationDistricts,
  useTransportationStates,
  useTransportationFilters,
  useRideMatching,
  useExportTransportationData,
  useWhatsAppIntegration,
} from "../../hooks/useTransportation";

const TransportationManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Filter management
  const { filters, updateFilter, updateFilters, resetFilters } =
    useTransportationFilters();

  // Data hooks
  const { data: stats, isLoading: isLoadingStats } =
    useTransportationStats(filters);
  const { data: providers, isLoading: isLoadingProviders } =
    useVehicleProviders(filters);
  const { data: seekers, isLoading: isLoadingSeekers } =
    useRideSeekers(filters);
  const { data: proximityGroups, isLoading: isLoadingGroups } =
    useProximityGroups({
      minGroupSize: 2,
    });
  const { data: districts } = useTransportationDistricts();
  const { data: states } = useTransportationStates();

  // Ride matching
  const {
    selectedSeeker,
    compatibleRides,
    isLoadingMatches,
    findMatches,
    clearMatches,
  } = useRideMatching();

  // WhatsApp integration
  const { contactRideProvider, contactRideSeeker, contactGroupMember } =
    useWhatsAppIntegration();

  // Export functionality
  const exportMutation = useExportTransportationData();

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "providers", name: "Vehicle Providers", icon: TruckIcon },
    { id: "seekers", name: "Ride Seekers", icon: UserGroupIcon },
    { id: "groups", name: "Proximity Groups", icon: MapIcon },
    { id: "matching", name: "Ride Matching", icon: UsersIcon },
  ];

  // Statistics cards for overview
  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  // Filters component
  const Filters = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, school, location..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filters.modeOfTransport}
          onChange={(e) => updateFilter("modeOfTransport", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Modes</option>
          <option value="car">Car</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="flight">Flight</option>
          <option value="two-wheeler">Two Wheeler</option>
          <option value="boat">Boat/Ship</option>
          <option value="looking-for-transport">Looking for Ride</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.district}
          onChange={(e) => updateFilter("district", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Districts</option>
          {districts?.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => updateFilter("date", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          onClick={resetFilters}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  // Overview tab content
  const OverviewContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Travellers"
          value={stats?.totalTravellers || 0}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Vehicle Providers"
          value={stats?.vehicleProviders?.count || 0}
          subtitle={`${
            stats?.vehicleProviders?.totalCapacity || 0
          } total seats`}
          icon={TruckIcon}
          color="green"
        />
        <StatCard
          title="Ride Seekers"
          value={stats?.rideSeekers?.count || 0}
          subtitle={`${stats?.rideSeekers?.totalNeeded || 0} people need rides`}
          icon={UserGroupIcon}
          color="orange"
        />
        <StatCard
          title="Proximity Groups"
          value={proximityGroups?.totalGroups || 0}
          subtitle={`${
            proximityGroups?.summary?.selfSustainableGroups || 0
          } self-sustainable`}
          icon={MapIcon}
          color="purple"
        />
      </div>

      {/* Mode breakdown chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transportation Mode Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats?.modeBreakdown &&
            Object.entries(stats.modeBreakdown).map(([mode, data]) => (
              <div key={mode} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {data.count}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {mode.replace("-", " ")}
                </div>
                {data.totalCapacity > 0 && (
                  <div className="text-xs text-green-600">
                    {data.totalCapacity} seats
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Export actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export Data
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => exportMutation.mutate("all")}
            disabled={exportMutation.isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export All
          </button>
          <button
            onClick={() => exportMutation.mutate("providers")}
            disabled={exportMutation.isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Providers
          </button>
          <button
            onClick={() => exportMutation.mutate("seekers")}
            disabled={exportMutation.isLoading}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Seekers
          </button>
        </div>
      </div>
    </div>
  );

  // Vehicle providers table
  const ProvidersTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Vehicle Providers
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle & Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route & Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers?.providers?.map((provider) => (
              <tr key={provider.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {provider.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.school}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900 capitalize">
                      <TruckIcon className="h-4 w-4 inline mr-1" />
                      {provider.transportation?.modeOfTransport}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.transportation?.vehicleCapacity} seats available
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      {provider.transportation?.startingLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
                      {provider.transportation?.travelDate}
                    </div>
                    {provider.transportation?.travelTime && (
                      <div className="text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {provider.transportation?.travelTime}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {provider.contactNumber}
                  </div>
                  {provider.whatsappNumber && (
                    <div className="text-sm text-gray-500">
                      WA: {provider.whatsappNumber}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => contactRideProvider(provider, {})}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Ride seekers table
  const SeekersTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Ride Seekers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seeker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route & Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {seekers?.seekers?.map((seeker) => (
              <tr key={seeker.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {seeker.name}
                    </div>
                    <div className="text-sm text-gray-500">{seeker.school}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <UsersIcon className="h-4 w-4 inline mr-1" />
                    {seeker.transportation?.groupSize || 1} people
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      {seeker.transportation?.startingLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
                      {seeker.transportation?.travelDate}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {seeker.contactNumber}
                  </div>
                  {seeker.whatsappNumber && (
                    <div className="text-sm text-gray-500">
                      WA: {seeker.whatsappNumber}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => findMatches(seeker)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                    Find Rides
                  </button>
                  <button
                    onClick={() => contactRideSeeker(seeker, {})}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Proximity groups content
  const ProximityGroupsContent = () => (
    <div className="space-y-6">
      {proximityGroups?.groups?.map((group) => (
        <div
          key={group.pincodeBase}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {group.areaName}
              </h3>
              <p className="text-sm text-gray-500">
                Pincode area: {group.pincodeBase}xxx
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {group.memberCount}
              </div>
              <div className="text-sm text-gray-500">members</div>
              {group.canSelfSustain && (
                <div className="text-xs text-green-600 font-medium">
                  Self-sustainable
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">
                {group.vehicleProviders}
              </div>
              <div className="text-sm text-green-600">Providers</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-700">
                {group.rideSeekers}
              </div>
              <div className="text-sm text-orange-600">Seekers</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">
                {group.totalCapacity}
              </div>
              <div className="text-sm text-blue-600">Total Seats</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Group Members</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.members.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">
                      {member.transportation?.modeOfTransport ===
                      "looking-for-transport"
                        ? "Seeking ride"
                        : member.transportation?.vehicleCapacity > 0
                        ? `${member.transportation.vehicleCapacity} seats`
                        : "Traveller"}
                    </div>
                  </div>
                  <button
                    onClick={() => contactGroupMember(member, group)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {group.members.length > 6 && (
              <p className="text-sm text-gray-500 mt-2">
                +{group.members.length - 6} more members
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transportation Management
          </h1>
          <p className="text-gray-600">
            Coordinate travel arrangements and ride sharing
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      {activeTab !== "overview" && activeTab !== "groups" && <Filters />}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "providers" && <ProvidersTable />}
          {activeTab === "seekers" && <SeekersTable />}
          {activeTab === "groups" && <ProximityGroupsContent />}
          {activeTab === "matching" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ride Matching System
              </h3>
              <p className="text-gray-600">
                Select a ride seeker from the "Ride Seekers" tab to find
                compatible providers.
              </p>
              {selectedSeeker && compatibleRides && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Compatible rides for {selectedSeeker.name}
                  </h4>
                  <div className="space-y-4">
                    {compatibleRides.compatibleRides?.map((ride) => (
                      <div
                        key={ride.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {ride.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {ride.school}
                            </p>
                            <p className="text-sm text-gray-500">
                              Distance: {ride.distance}km | Score:{" "}
                              {ride.compatibilityScore}%
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              contactRideProvider(ride, selectedSeeker)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Contact Provider
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Loading states */}
      {(isLoadingStats ||
        isLoadingProviders ||
        isLoadingSeekers ||
        isLoadingGroups) && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default TransportationManagement;
