import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  getTransportationStats,
  getVehicleProviders,
  getRideSeekers,
  findCompatibleRides,
  getProximityGroups,
  getTransportationDistricts,
  getTransportationStates,
  exportTransportationData,
  contactViaWhatsApp,
  generateRideMessage,
} from "../api/transportationApi";

// Transportation statistics hook
export const useTransportationStats = (filters = {}) => {
  return useQuery({
    queryKey: ["transportationStats", filters],
    queryFn: () => getTransportationStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
};

// Vehicle providers hook
export const useVehicleProviders = (filters = {}) => {
  return useQuery({
    queryKey: ["vehicleProviders", filters],
    queryFn: () => getVehicleProviders(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

// Ride seekers hook
export const useRideSeekers = (filters = {}) => {
  return useQuery({
    queryKey: ["rideSeekers", filters],
    queryFn: () => getRideSeekers(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

// Compatible rides hook
export const useCompatibleRides = (seekerId, options = {}, enabled = false) => {
  return useQuery({
    queryKey: ["compatibleRides", seekerId, options],
    queryFn: () => findCompatibleRides(seekerId, options),
    enabled: enabled && !!seekerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Proximity groups hook
export const useProximityGroups = (options = {}) => {
  return useQuery({
    queryKey: ["proximityGroups", options],
    queryFn: () => getProximityGroups(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

// Transportation districts hook
export const useTransportationDistricts = () => {
  return useQuery({
    queryKey: ["transportationDistricts"],
    queryFn: getTransportationDistricts,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

// Transportation states hook
export const useTransportationStates = () => {
  return useQuery({
    queryKey: ["transportationStates"],
    queryFn: getTransportationStates,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

// Export data mutation
export const useExportTransportationData = () => {
  return useMutation({
    mutationFn: exportTransportationData,
    onSuccess: () => {
      // Show success notification if needed
    },
    onError: (error) => {
      console.error("Export failed:", error);
    },
  });
};

// Transportation filter management hook
export const useTransportationFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: "",
    modeOfTransport: "all",
    district: "all",
    state: "all",
    date: "",
    page: 1,
    limit: 20,
    sortBy: "registrationDate",
    sortOrder: "desc",
    ...initialFilters,
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when other filters change
    }));
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when multiple filters change
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      modeOfTransport: "all",
      district: "all",
      state: "all",
      date: "",
      page: 1,
      limit: 20,
      sortBy: "registrationDate",
      sortOrder: "desc",
    });
  };

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
  };
};

// Ride matching hook for finding and managing compatible rides
export const useRideMatching = () => {
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [matchingOptions, setMatchingOptions] = useState({
    maxDistance: 50,
    sameDateOnly: true,
    modeOfTransport: "all",
  });

  const {
    data: compatibleRides,
    isLoading: isLoadingMatches,
    error: matchingError,
    refetch: refetchMatches,
  } = useCompatibleRides(selectedSeeker?.id, matchingOptions, !!selectedSeeker);

  const findMatches = (seeker) => {
    setSelectedSeeker(seeker);
  };

  const updateMatchingOptions = (options) => {
    setMatchingOptions((prev) => ({ ...prev, ...options }));
  };

  const clearMatches = () => {
    setSelectedSeeker(null);
  };

  const contactProvider = (provider, message) => {
    const phoneNumber = provider.whatsappNumber || provider.contactNumber;
    if (phoneNumber) {
      contactViaWhatsApp(phoneNumber, message);
    }
  };

  return {
    selectedSeeker,
    compatibleRides,
    isLoadingMatches,
    matchingError,
    matchingOptions,
    findMatches,
    updateMatchingOptions,
    clearMatches,
    contactProvider,
    refetchMatches,
  };
};

// Transportation summary hook for dashboard overview
export const useTransportationSummary = (filters = {}) => {
  const { data: stats, isLoading: isLoadingStats } =
    useTransportationStats(filters);
  const { data: proximityGroups, isLoading: isLoadingGroups } =
    useProximityGroups({
      minGroupSize: 3,
    });

  const summary = useMemo(() => {
    if (!stats) return null;

    return {
      totalTravellers: stats.totalTravellers || 0,
      vehicleProviders: stats.vehicleProviders?.count || 0,
      rideSeekers: stats.rideSeekers?.count || 0,
      totalCapacity: stats.vehicleProviders?.totalCapacity || 0,
      capacityUtilization:
        stats.vehicleProviders?.totalCapacity > 0
          ? Math.round(
              ((stats.rideSeekers?.totalNeeded || 0) /
                stats.vehicleProviders.totalCapacity) *
                100
            )
          : 0,
      ridesharingAvailable: stats.ridesharingAvailable?.count || 0,
      needParking: stats.vehicleProviders?.needParking || 0,
      proximityGroups: proximityGroups?.totalGroups || 0,
      selfSustainableGroups:
        proximityGroups?.summary?.selfSustainableGroups || 0,
      modeBreakdown: stats.modeBreakdown || {},
    };
  }, [stats, proximityGroups]);

  return {
    summary,
    isLoading: isLoadingStats || isLoadingGroups,
  };
};

// WhatsApp integration hook
export const useWhatsAppIntegration = () => {
  const contactRideProvider = (provider, seeker) => {
    const phoneNumber = provider.whatsappNumber || provider.contactNumber;
    if (phoneNumber) {
      const message = generateRideMessage(seeker, provider, true);
      contactViaWhatsApp(phoneNumber, message);
    }
  };

  const contactRideSeeker = (seeker, provider) => {
    const phoneNumber = seeker.whatsappNumber || seeker.contactNumber;
    if (phoneNumber) {
      const message = generateRideMessage(seeker, provider, false);
      contactViaWhatsApp(phoneNumber, message);
    }
  };

  const contactGroupMember = (member, groupInfo, customMessage = "") => {
    const phoneNumber = member.whatsappNumber || member.contactNumber;
    if (phoneNumber) {
      const defaultMessage =
        customMessage ||
        `Hi ${member.name}, I saw you're travelling from ${groupInfo.areaName}. Would you like to coordinate our travel plans? Let's connect!`;
      contactViaWhatsApp(phoneNumber, defaultMessage);
    }
  };

  return {
    contactRideProvider,
    contactRideSeeker,
    contactGroupMember,
  };
};

export default {
  useTransportationStats,
  useVehicleProviders,
  useRideSeekers,
  useCompatibleRides,
  useProximityGroups,
  useTransportationDistricts,
  useTransportationStates,
  useExportTransportationData,
  useTransportationFilters,
  useRideMatching,
  useTransportationSummary,
  useWhatsAppIntegration,
};
