import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userLogsApi from "../api/userLogs";
import { toast } from "react-toastify";

// Query keys
export const userLogsKeys = {
  all: ["user-logs"],
  lists: () => [...userLogsKeys.all, "list"],
  list: (filters) => [...userLogsKeys.lists(), filters],
  details: () => [...userLogsKeys.all, "detail"],
  detail: (id) => [...userLogsKeys.details(), id],
  stats: () => [...userLogsKeys.all, "stats"],
  timeline: (userId) => [...userLogsKeys.all, "timeline", userId],
};

// Hook to get paginated user logs
export const useUserLogs = (filters = {}) => {
  const {
    currentPage = 1,
    limit = 20,
    search = "",
    method = "",
    category = "",
    statusCode = "",
    startDate = "",
    endDate = "",
    userEmail = "",
  } = filters;

  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: limit.toString(),
    search,
    method,
    category,
    statusCode,
    startDate,
    endDate,
    userEmail,
  }).toString();

  return useQuery({
    queryKey: userLogsKeys.list({
      currentPage,
      limit,
      search,
      method,
      category,
      statusCode,
      startDate,
      endDate,
      userEmail,
    }),
    queryFn: () => userLogsApi.getUserLogs(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes (logs change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => ({
      logs: data.data.data.logs || [],
      pagination: data.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20,
        hasPrevPage: false,
        hasNextPage: false,
      },
    }),
  });
};

// Hook to get user logs statistics
export const useUserLogsStats = () => {
  return useQuery({
    queryKey: userLogsKeys.stats(),
    queryFn: userLogsApi.getUserLogsStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => data.data.data,
  });
};

// Hook to get a single user log
export const useUserLog = (id) => {
  return useQuery({
    queryKey: userLogsKeys.detail(id),
    queryFn: () => userLogsApi.getUserLogById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes (individual logs don't change)
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: (data) => data.data.data.log,
  });
};

// Hook to get user activity timeline
export const useUserActivityTimeline = (userId) => {
  return useQuery({
    queryKey: userLogsKeys.timeline(userId),
    queryFn: () => userLogsApi.getUserActivityTimeline(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to export user logs
export const useExportUserLogs = () => {
  return useMutation({
    mutationFn: ({ filters, format = "csv" }) => {
      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value)
        ),
      }).toString();

      return userLogsApi.exportUserLogs(queryParams);
    },
    onSuccess: (response) => {
      // Handle file download
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("User logs exported successfully");
    },
    onError: (error) => {
      console.error("Error exporting user logs:", error);
      toast.error(error.message || "Failed to export user logs");
    },
  });
};

// Hook to cleanup user logs
export const useCleanupUserLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogsApi.cleanupUserLogs,
    onSuccess: () => {
      toast.success("User logs cleaned up successfully");

      // Invalidate all user logs queries
      queryClient.invalidateQueries({ queryKey: userLogsKeys.all });
    },
    onError: (error) => {
      console.error("Error cleaning up user logs:", error);
      toast.error(error.message || "Failed to cleanup user logs");
    },
  });
};
