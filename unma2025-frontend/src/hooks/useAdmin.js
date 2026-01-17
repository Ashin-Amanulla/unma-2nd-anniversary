import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import adminApi from "../api/adminApi";

const ADMIN_KEYS = {
  DASHBOARD_STATS: "dashboard-stats",
  REGISTRATION_STATS: "registration-stats",
  DAILY_REGISTRATIONS: "daily-registrations",
  REGISTRATIONS: "registrations",
  SUB_ADMINS: "sub-admins",
  ANALYTICS: "analytics",
  SCHOOLS: "schools",
};

export const useAdmin = () => {
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: [ADMIN_KEYS.DASHBOARD_STATS],
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      if (!response) throw new Error("Failed to fetch dashboard stats");
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch registration stats for registrations page
  const useRegistrationStats = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.REGISTRATION_STATS],
      queryFn: async () => {
        const response = await adminApi.getRegistrationStats();
        if (!response) throw new Error("Failed to fetch registration stats");
        return response;
      },
      refetchInterval: 30000, // Refetch every 30 seconds
    });
  };

  // Fetch daily registrations for chart
  const useDailyRegistrations = (days = 30) => {
    return useQuery({
      queryKey: [ADMIN_KEYS.DAILY_REGISTRATIONS, days],
      queryFn: async () => {
        const response = await adminApi.getDailyRegistrations(days);
        if (!response) throw new Error("Failed to fetch daily registrations");
        return response;
      },
      refetchInterval: 60000, // Refetch every minute
    });
  };

  // Fetch registrations with filters
  const useRegistrations = (filters = {}) => {
    return useQuery({
      queryKey: [ADMIN_KEYS.REGISTRATIONS, filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await adminApi.getAllRegistrations(queryParams);
        console.log(response);
        if (!response) throw new Error("Failed to fetch registrations");
        return response;
      },
      keepPreviousData: true,
    });
  };

  // Fetch analytics data
  const useAnalytics = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.ANALYTICS],
      queryFn: async () => {
        const response = await adminApi.getAnalytics();
        if (!response) throw new Error("Failed to fetch analytics data");
        return response;
      },
      refetchInterval: 60000, // Refetch every minute
    });
  };

  // Fetch district analytics
  const useDistrictAnalytics = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.ANALYTICS, "district"],
      queryFn: async () => {
        const response = await adminApi.getDistrictAnalytics();
        if (!response) throw new Error("Failed to fetch district analytics");
        return response;
      },
      refetchInterval: 60000, // Refetch every minute
    });
  };

  // Fetch payment analytics
  const usePaymentAnalytics = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.ANALYTICS, "payment"],
      queryFn: async () => {
        const response = await adminApi.getPaymentAnalytics();
        console.log("payment analytics", response);
        if (!response) throw new Error("Failed to fetch payment analytics");
        return response;
      },
      refetchInterval: 60000, // Refetch every minute
    });
  };

  // Fetch Razorpay payments by school
  const useRazorpayPaymentsBySchool = (school = "") => {
    return useQuery({
      queryKey: [ADMIN_KEYS.ANALYTICS, "razorpay-payments", school],
      queryFn: async () => {
        const response = await adminApi.getRazorpayPaymentsBySchool(school);
        if (!response) throw new Error("Failed to fetch Razorpay payments by school");
        return response;
      },
      refetchInterval: 300000, // Refetch every 5 minutes
    });
  };

  // Fetch sub-admins list
  const useSubAdmins = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.SUB_ADMINS],
      queryFn: async () => {
        const response = await adminApi.getSubAdmins();
        if (!response) throw new Error("Failed to fetch sub-admins");
        return response.data;
      },
    });
  };

  // Fetch available schools
  const useAvailableSchools = () => {
    return useQuery({
      queryKey: [ADMIN_KEYS.SCHOOLS],
      queryFn: async () => {
        const response = await adminApi.getAvailableSchools();
        if (!response) throw new Error("Failed to fetch schools");
        return response.data;
      },
    });
  };

  // Export all registrations
  const exportAllRegistrations = async () => {
    try {
      const response = await adminApi.exportAllRegistrations();
      if (!response) throw new Error("Failed to export registrations");
      return response;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  // Create registration
  const createRegistrationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create registration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
      queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATION_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
      toast.success("Registration created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create registration");
    },
  });

  // Update registration
  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update registration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
      queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATION_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
      toast.success("Registration updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update registration");
    },
  });

  // Delete registration
  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/registrations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete registration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATIONS]);
      queryClient.invalidateQueries([ADMIN_KEYS.DASHBOARD_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.REGISTRATION_STATS]);
      queryClient.invalidateQueries([ADMIN_KEYS.ANALYTICS]);
      toast.success("Registration deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete registration");
    },
  });

  // Create sub-admin
  const useCreateSubAdmin = () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await adminApi.createSubAdmin(data);
        if (!response) throw new Error("Failed to create sub-admin");
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries([ADMIN_KEYS.SUB_ADMINS]);
        toast.success("Sub-admin created successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create sub-admin");
      },
    });
  };

  // Update sub-admin
  const useUpdateSubAdmin = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }) => {
        const response = await adminApi.updateSubAdmin(id, data);
        if (!response) throw new Error("Failed to update sub-admin");
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries([ADMIN_KEYS.SUB_ADMINS]);
        toast.success("Sub-admin updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update sub-admin");
      },
    });
  };

  return {
    // Data
    dashboardStats,
    isLoadingStats,

    // Hooks
    useRegistrationStats,
    useDailyRegistrations,
    useRegistrations,
    useAnalytics,
    useDistrictAnalytics,
    usePaymentAnalytics,
    useRazorpayPaymentsBySchool,
    useSubAdmins,
    useAvailableSchools,

    // Mutations
    createRegistrationMutation,
    updateRegistrationMutation,
    deleteRegistrationMutation,
    useCreateSubAdmin,
    useUpdateSubAdmin,

    // Export functions
    exportAllRegistrations,
  };
};
