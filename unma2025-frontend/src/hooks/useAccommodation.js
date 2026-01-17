import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import accommodationApi from "../api/accommodationApi";

// Query keys for accommodation
export const accommodationKeys = {
  all: ["accommodation"],
  stats: (params) => [...accommodationKeys.all, "stats", params],
  providers: (params) => [...accommodationKeys.all, "providers", params],
  seekers: (params) => [...accommodationKeys.all, "seekers", params],
  hotels: (params) => [...accommodationKeys.all, "hotels", params],
  compatible: (seekerId) => [...accommodationKeys.all, "compatible", seekerId],
  districts: () => [...accommodationKeys.all, "districts"],
  schools: () => [...accommodationKeys.all, "schools"],
};

// Hook for accommodation statistics
export const useAccommodationStats = (params = {}) => {
  return useQuery({
    queryKey: accommodationKeys.stats(params),
    queryFn: () => accommodationApi.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch accommodation statistics"
      );
    },
  });
};

// Hook for accommodation providers
export const useAccommodationProviders = (params = {}) => {
  return useQuery({
    queryKey: accommodationKeys.providers(params),
    queryFn: () => accommodationApi.getProviders(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch accommodation providers"
      );
    },
  });
};

// Hook for accommodation seekers
export const useAccommodationSeekers = (params = {}) => {
  return useQuery({
    queryKey: accommodationKeys.seekers(params),
    queryFn: () => accommodationApi.getSeekers(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to fetch accommodation seekers"
      );
    },
  });
};

// Hook for hotel requests
export const useHotelRequests = (params = {}) => {
  return useQuery({
    queryKey: accommodationKeys.hotels(params),
    queryFn: () => accommodationApi.getHotelRequests(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to fetch hotel requests"
      );
    },
  });
};

// Hook for finding compatible providers
export const useCompatibleProviders = (seekerId, options = {}) => {
  return useQuery({
    queryKey: accommodationKeys.compatible(seekerId),
    queryFn: () => accommodationApi.findCompatibleProviders(seekerId),
    enabled: !!seekerId && options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to find compatible providers"
      );
    },
  });
};

// Hook for accommodation districts
export const useAccommodationDistricts = () => {
  return useQuery({
    queryKey: accommodationKeys.districts(),
    queryFn: accommodationApi.getDistricts,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch accommodation districts"
      );
    },
  });
};

// Hook for schools
export const useAccommodationSchools = () => {
  return useQuery({
    queryKey: accommodationKeys.schools(),
    queryFn: accommodationApi.getSchools,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to fetch schools");
    },
  });
};

// Hook for exporting accommodation data
export const useExportAccommodationData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type) => accommodationApi.exportData(type),
    onSuccess: (data, type) => {
      toast.success(`${type} data exported successfully!`);

      // Convert data to CSV and download
      if (data?.data && Array.isArray(data.data)) {
        downloadCSV(
          data.data,
          `accommodation-${type}-${new Date().toISOString().split("T")[0]}.csv`
        );
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to export accommodation data"
      );
    },
  });
};

// Helper function to download CSV
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    toast.warning("No data to export");
    return;
  }

  // Get headers from first object
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

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Custom hook for managing accommodation filters
export const useAccommodationFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: "",
    gender: "all",
    district: "all",
    school: "all",
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
      // Reset page when changing filters
      ...(key !== "page" && { page: 1 }),
    }));
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      gender: "all",
      district: "all",
      school: "all",
      page: 1,
      limit: 20,
      sortBy: "registrationDate",
      sortOrder: "desc",
      ...initialFilters,
    });
  };

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
  };
};

// Custom hook for contact functionality
export const useContactPerson = () => {
  const contactPerson = (contactNumber, name) => {
    if (!contactNumber) {
      toast.error("Contact number not available");
      return;
    }

    const phoneNumber = contactNumber.replace(/\D/g, ""); // Remove non-digits
    const message = `Hello ${name}, I am contacting you regarding accommodation for UNMA 2026. Could you please provide more details about your accommodation offering?`;
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    toast.success(`Opening WhatsApp to contact ${name}`);
  };

  return { contactPerson };
};
